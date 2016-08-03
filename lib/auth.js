'use strict';

var assign = require('object-assign');
var axios = require('axios');
var Bluebird = require('bluebird');
var formUrlEncoded = require('form-urlencoded');
var need = require('./need');

var defaults = {
    win: window,
    authenticateOnStart: true,
    apiAuthenticateUrl: 'https://api.mendeley.com/oauth/authorize',
    accessTokenCookieName: 'accessToken',
    scope: 'all'
};

var defaultsImplicitFlow = {
    clientId: false,
    redirectUrl: false
};

var defaultsAuthCodeFlow = {
    apiAuthenticateUrl: '/login',
    refreshAccessTokenUrl: false
};

module.exports = {
    implicitGrantFlow: implicitGrantFlow,
    authCodeFlow: authCodeFlow,
    authenticatedFlow: authenticatedFlow,
    clientCredentialsFlow: clientCredentialsFlow,
    refreshTokenFlow: refreshTokenFlow
};

function authenticatedFlow(token) {
    return {
        authenticate: noop,
        getToken: function() {
            return token;
        },
        refreshToken: noop
    };
}

function implicitGrantFlow(options) {

    var settings = assign({}, defaults, defaultsImplicitFlow, options || {});

    need(settings.clientId, 'You must provide a clientId for implicit grant flow');

    // OAuth redirect url defaults to current url
    if (!settings.redirectUrl) {
        var loc = settings.win.location;
        settings.redirectUrl = loc.protocol + '//' + loc.host + loc.pathname;
    }

    settings.apiAuthenticateUrl = settings.apiAuthenticateUrl +
        '?client_id=' + settings.clientId +
        '&redirect_uri=' + settings.redirectUrl +
        '&scope=' + settings.scope +
        '&response_type=token';

    if (settings.authenticateOnStart && !getAccessTokenCookieOrUrl(settings)) {
        authenticate(settings);
    }

    return {
        authenticate: authenticate.bind(null, settings),
        getToken: getAccessTokenCookieOrUrl.bind(null, settings),
        refreshToken: function () {
          return false;
        }
    };
}

function authCodeFlow(options) {

    var settings = assign({}, defaults, defaultsAuthCodeFlow, options || {});

    need(settings.apiAuthenticateUrl, 'You must provide an apiAuthenticateUrl for auth code flow');

    if (settings.authenticateOnStart && !getAccessTokenCookie(settings)) {
        authenticate(settings);
    }

    return {
        authenticate: authenticate.bind(null, settings),
        getToken: getAccessTokenCookie.bind(null, settings),
        refreshToken: refreshAccessTokenCookie.bind(null, settings)
    };
}

function clientCredentialsFlow(options) {
  var settings = assign({}, {
    tokenUrl: 'https://api.mendeley.com/oauth/token',
    clientId: undefined,
    clientSecret: undefined,
    redirectUri: undefined,
    scope: 'all'
  }, options || {});

  need(settings.clientId, 'You must provide a clientId for client credentials flow');
  need(settings.clientSecret, 'You must provide a clientSecret for client credentials flow');
  need(settings.redirectUri, 'You must provide a redirectUri for client credentials flow');

  return {
      authenticate: noop,
      getToken: function () {
        return settings.accessToken;
      },
      refreshToken: function () {
        return axios.post(settings.tokenUrl, formUrlEncoded({
          'grant_type': 'client_credentials',
          'client_id': settings.clientId,
          'client_secret': settings.clientSecret,
          'redirect_uri': settings.redirectUri,
          'scope': settings.scope
        }))
        .then(function (result) {
          /*jshint camelcase: false */
          settings.accessToken = result.data.access_token;
        });
      }
  };
}

function refreshTokenFlow(options) {
  var settings = assign({}, {
    tokenUrl: 'https://api.mendeley.com/oauth/token',
    clientId: undefined,
    clientSecret: undefined,
    refreshToken: undefined,
    accessToken: undefined,
    onAccessToken: noop,
    onRefreshToken: noop
  }, options || {});

  need(settings.clientId, 'You must provide a clientId for refresh token flow');
  need(settings.clientSecret, 'You must provide a clientSecret for refresh token flow');
  need(settings.refreshToken, 'You must provide a refreshToken for refresh token flow');

  return {
      authenticate: noop,
      getToken: function () {
        return settings.accessToken;
      },
      refreshToken: function () {
        return axios.post(settings.tokenUrl, formUrlEncoded({
          'grant_type': 'refresh_token',
          'client_id': settings.clientId,
          'client_secret': settings.clientSecret,
          'refresh_token': settings.refreshToken
        }))
        .then(function (result) {
          /*jshint camelcase: false */
          var expiresIn = result.data.expires_in * 1000;

          settings.accessToken = result.data.access_token;
          settings.refreshToken = result.data.refresh_token;
          settings.onAccessToken(settings.accessToken, expiresIn);
          settings.onRefreshToken(settings.refreshToken);

          return {
            refreshToken: settings.refreshToken,
            accessToken: settings.accessToken,
            expiresIn: expiresIn
          };
        });
      }
  };
}

function noop() {}

function authenticate(settings) {
    var url = typeof settings.apiAuthenticateUrl === 'function' ?
        settings.apiAuthenticateUrl() : settings.apiAuthenticateUrl;

    clearAccessTokenCookie(settings);
    settings.win.location = url;
}

function getAccessTokenCookieOrUrl(settings) {
    var location = settings.win.location,
        hash = location.hash ? location.hash.split('=')[1] : '',
        cookie = getAccessTokenCookie(settings);

    if (hash && !cookie) {
        setAccessTokenCookie(settings, hash);
        return hash;
    }
    if (!hash && cookie) {
        return cookie;
    }
    if (hash && cookie) {
        if (hash !== cookie) {
            setAccessTokenCookie(settings, hash);
            return hash;
        }
        return cookie;
    }

    return '';
}

function getAccessTokenCookie(settings) {
    var name = settings.accessTokenCookieName + '=',
        ca = settings.win.document.cookie.split(';');

    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) !== -1) {
            return c.substring(name.length, c.length);
        }
    }

    return '';
}

function setAccessTokenCookie(settings, accessToken, expireHours) {
    var d = new Date();
    d.setTime(d.getTime() + ((expireHours || 1)*60*60*1000));
    var expires = 'expires=' + d.toUTCString();
    settings.win.document.cookie = settings.accessTokenCookieName + '=' + accessToken + '; ' + expires;
}

function clearAccessTokenCookie(settings) {
    setAccessTokenCookie(settings, '', -1);
}

function refreshAccessTokenCookie(settings) {
    if (settings.refreshAccessTokenUrl) {
        return new Bluebird(function(resolve, reject) {
            axios.get(settings.refreshAccessTokenUrl)
                .then(resolve)
                .catch(reject);
        });
    }

    return false;
}
