define(['axios', 'object-assign', 'bluebird'], function(axios, assign) {

    'use strict';

    var defaults = {
        authFlow: false,
        maxRetries: 0,
        maxAuthRetries: 1,
        followLocation: false,
        fileUpload: false,
    };
    var noopNotifier = { notify: function() {}};

    function create(request, settings, notifier) {
        return new Request(request, assign({}, defaults, settings), notifier);
    }

    function Request(request, settings, notifier) {
        if (!settings.authFlow) {
            throw new Error('Please provide an authentication interface');
        }
        this.request = request;
        this.settings = settings;
        this.retries = 0;
        this.authRetries = 0;
        this.notifier = notifier || noopNotifier;

        this.notifier.notify('startInfo', [this.request.method, this.request.url], this.request);
    }

    function send(request) {
        request = request || this.request;

        var token = this.settings.authFlow.getToken(),
            headers = assign({ Accept: '' }, request.headers);

        // If no token at all (cookie deleted or expired) refresh token if possible or authenticate
        // because if you send 'Bearer ' you get a 400 rather than a 401 - is that a bug in the api?
        if (!token) {
            this.authRetries++;
            this.notifier.notify('authWarning', ['n.a.', this.authRetries, this.settings.maxAuthRetries], this.request);
            return refreshToken.call(this);
        }

        request.headers = headers;
        request.headers.Authorization = 'Bearer ' + token;

        request.method = request.method.toLowerCase();

        return axios.request(request)
            .then(onDone.bind(this))
            .catch(onFail.bind(this));
    }

    function onFail(response) {
        switch (response.status) {
            case 0:
            case 504:
                // 504 Gateway timeout or communication error
                if (this.retries < this.settings.maxRetries) {
                    this.retries++;
                    this.notifier.notify('commWarning', [response.status, this.retries, this.settings.maxRetries], this.request, response);
                    return this.send();
                } else {
                    this.notifier.notify('commError', [response.status, this.settings.maxRetries], this.request, response);
                    throw response;
                }
                break;

            case 401:
                // 401 Unauthorized
                if (this.authRetries < this.settings.maxAuthRetries) {
                    this.authRetries++;
                    this.notifier.notify('authWarning', [response.status, this.authRetries, this.settings.maxAuthRetries], this.request, response);
                    return refreshToken.call(this);
                } else {
                    this.notifier.notify('authError', [response.status, this.settings.maxAuthRetries], this.request, response);
                    this.settings.authFlow.authenticate(200);
                    throw response;
                }
                break;

            default:
                this.notifier.notify('reqError', [response.status], this.request, response);
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
            this.notifier.notify('redirectInfo', null, this.request, redirect);
            return this.send(redirect);
        } else {
            if (response.headers.link && typeof response.headers.link === 'string') {
                response.headers.link = extractLinkHeaders(response.headers.link);
            }

            // File uploads have type set to text, so if there is some JSON parse it manually
            if (this.settings.fileUpload) {
                if (response) {
                    try {
                        response = JSON.parse(response);
                    } catch (error) {
                        this.notifier.notify('parseError', null, this.request, response);
                        throw error;
                    }
                }
                this.notifier.notify('uploadSuccessInfo', null, this.request, response);
            } else {
                this.notifier.notify('successInfo', null, this.request, response);
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
                    this.notifier.notify('refreshError', [response.status], this.request, response.request);
                    this.settings.authFlow.authenticate(200);
                    throw response;
                }.bind(this))
                // If OK update the access token and re-send the request
                .then(function() {
                    return this.send();
                }.bind(this));
        } else {
            this.notifier.notify('refreshNotConfigured', []);
            this.settings.authFlow.authenticate(200);
            throw new Error('No token');
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

    return { create: create };

});
