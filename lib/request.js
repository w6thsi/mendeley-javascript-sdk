'use strict';

var axios = require('axios');
var assign = require('object-assign');
var Bluebird = require('bluebird');

var defaults = {
    authFlow: false,
    maxRetries: 0,
    maxAuthRetries: 1,
    followLocation: false
};

function create(request, settings) {
    return new Request(request, assign({}, defaults, settings));
}

function Request(request, settings) {
    if (!settings.authFlow) {
        throw new Error('Please provide an authentication interface');
    }
    this.request = request;
    this.settings = settings;
    this.retries = 0;
    this.authRetries = 0;
}

function send(request) {
    request = request || this.request;

    var token = this.settings.authFlow.getToken();

    // If no token at all (cookie deleted or expired), attempt to refresh token
    if (!token) {
        this.authRetries++;
        return refreshToken.call(this);
    }

    // remove any headers without values because axios objects to them
    for (var key in request.headers) {
        if (request.headers[key] === null || request.headers[key] === undefined) {
            delete request.headers[key];
        }
    }

    // add default accept header
    request.headers = assign({
        Accept: ''
    }, request.headers);

    // add auth header
    request.headers.Authorization = 'Bearer ' + token;

    request.method = request.method.toLowerCase();

    return new Bluebird(function(resolve, reject) {
        axios.request(request)
            .then(resolve)
            .catch(reject);
    }).then(onDone.bind(this)).catch(onFail.bind(this));
}

function onFail(response) {
    switch (response.status) {
        case 0:
        case 504:
            // 504 Gateway timeout or communication error
            if (this.retries < this.settings.maxRetries) {
                this.retries++;
                return this.send();
            } else {
                throw response;
            }
            break;

        case 401:
            // 401 Unauthorized
            if (this.authRetries < this.settings.maxAuthRetries) {
                this.authRetries++;
                return refreshToken.call(this);
            } else {
                this.settings.authFlow.authenticate();
                throw response;
            }
            break;

        default:
            throw response;
    }
}

function onDone(response) {
    var locationHeader = response.headers.location;

    if (locationHeader && this.settings.followLocation && response.status === 201) {
        var redirect = {
            method: 'GET',
            url: locationHeader,
            responseType: 'json'
        };

        return this.send(redirect);
    } else {
        if (response.headers.link && typeof response.headers.link === 'string') {
            response.headers.link = extractLinkHeaders(response.headers.link);
        }

        return response;
    }
}

function refreshToken() {
    var refresh = this.settings.authFlow.refreshToken();
    if (refresh) {
        return refresh
            // If fails then we need to re-authenticate
            .catch(function(response) {
                this.settings.authFlow.authenticate();
                throw response;
            }.bind(this))
            // If OK update the access token and re-send the request
            .then(function() {
                return this.send();
            }.bind(this));
    } else {
        this.settings.authFlow.authenticate();
        return Bluebird.reject(new Error('No token'));
    }
}

function extractLinkHeaders(links) {
    // Tidy into nice object like {next: 'http://example.com/?p=1'}
    var tokens, url, rel, linksArray = links.split(','), value = {};
    for (var i = 0, l = linksArray.length; i < l; i++) {
        tokens = linksArray[i].split(';');
        url = tokens[0].replace(/[<>]/g, '').trim();
        rel = tokens[1].trim().split('=')[1].replace(/"/g, '');
        value[rel] = url;
    }

    return value;
}

Request.prototype = {
    send: send
};

module.exports = {
    create: create
};
