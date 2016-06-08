'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');

if (typeof process === 'object' && process + '' === '[object process]') {
    global.window = {};
}

describe('auth', function() {

    var mockWindow = require('../../mocks/window');
    var auth = require('../../../lib/auth');

    describe('implicit grant flow', function() {
        it('should authenticate on start by default', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999};

            auth.implicitGrantFlow(options);
            expect(win.location).toMatch(new RegExp('^https://api.mendeley.com/oauth/authorize?.+'));
        });

        it('should NOT authenticate on start if authenticateOnStart: false', function() {
            var win = mockWindow('https:', 'example.com', '/app');
            var options = {win: win, clientId: 9999, authenticateOnStart: false};
            auth.implicitGrantFlow(options);
            expect(win.location.toString()).toEqual('https://example.com/app');
        });

        it('should trigger a redirect on calling authenticate()', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, authenticateOnStart: false};

            auth.implicitGrantFlow(options).authenticate();
            expect(win.location).toMatch(new RegExp('^https://api.mendeley.com/oauth/authorize?.+'));
        });

        it('should read the access token from a cookie', function() {
            var win = mockWindow();
            win.document.cookie = 'accessToken=auth';
            var options = {win: win, clientId: 9999};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.getToken()).toEqual('auth');
        });

        it('should read the access token from a URL hash', function() {
            var win = mockWindow('https:', 'example.com', 'app', 'token=auth');
            var options = {win: win, clientId: 9999};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.getToken()).toEqual('auth');
        });

        it('should prefer an access token in the hash over the URL', function() {
            var win = mockWindow('https:', 'example.com', 'app', 'token=hash-auth');
            win.document.cookie = 'accessToken=cookie-auth';
            var options = {win: win, clientId: 9999};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.getToken()).toEqual('hash-auth');
        });

        it('should NOT support refresh token URL', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, refreshAccessTokenUrl: '/refresh'};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.refreshToken()).toBe(false);
        });

    });

    describe('auth code flow', function() {

        it('should authenticate on start by default', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999};

            auth.authCodeFlow(options);
            expect(win.location).toEqual('/login');
        });

        it('should NOT authenticate on start if authenticateOnStart: false', function() {
            var win = mockWindow('https:', 'example.com', '/app');
            var options = {win: win, clientId: 9999, authenticateOnStart: false};

            auth.authCodeFlow(options);
            expect(win.location.toString()).toEqual('https://example.com/app');
        });

        it('should trigger a redirect on calling authenticate()', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, authenticateOnStart: false};

            auth.authCodeFlow(options).authenticate();
            expect(win.location).toEqual('/login');
        });

        it('should support using a function to get the auth URL', function() {
            var win = mockWindow();
            var options = {
              win: win,
              clientId: 9999,
              authenticateOnStart: false,
              apiAuthenticateUrl: function() {
                  return '/login?state=foo';
              }
           };

            auth.authCodeFlow(options).authenticate();
            expect(win.location).toEqual('/login?state=foo');
        });

        it('should read the access token from a cookie', function() {
            var win = mockWindow();
            win.document.cookie = 'accessToken=auth';
            var options = {win: win, clientId: 9999};

            var flow = auth.authCodeFlow(options);
            expect(flow.getToken()).toEqual('auth');
        });

        it('should NOT read the access token from a URL hash', function() {
            var win = mockWindow('https:', 'example.com', 'app', 'token=auth');
            var options = {win: win, clientId: 9999};

            var flow = auth.authCodeFlow(options);
            expect(flow.getToken()).toEqual('');
        });

        it('should support refresh token URL', function() {
            var ajaxRequest;
            var ajaxSpy = spyOn(axios, 'get').and.returnValue(Bluebird.resolve());
            var win = mockWindow();
            var options = {win: win, clientId: 9999, refreshAccessTokenUrl: '/refresh'};

            var flow = auth.authCodeFlow(options);
            flow.refreshToken();
            expect(ajaxSpy).toHaveBeenCalled();

            ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            expect(ajaxRequest).toBe('/refresh');
        });

    });

    describe('pre auth flow', function() {

        it('should return the previously created access token', function() {
            var authFlow = auth.authenticatedFlow('token1234');
            expect(authFlow.getToken()).toBe('token1234');
        });

    });
});
