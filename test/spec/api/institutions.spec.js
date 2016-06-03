define(function(require) {

    'use strict';

    var Promise = require('bluebird');
    var axios = require('axios');
    require('es5-shim');

    describe('institutions api', function() {

        var api = require('api');
        var institutionsApi = api.institutions;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('search method', function() {
            var ajaxSpy;
            var ajaxRequest;
            var params = {
                hint: 'lon',
                limit: 10
            };

            it('should be defined', function() {
                expect(typeof institutionsApi.search).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());
                institutionsApi.search(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /institutions', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/institutions');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should allow paramaters', function() {
                expect(ajaxRequest.data).toEqual(params);
            });

        });

        describe('retrieve method', function() {
            var ajaxSpy;
            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof institutionsApi.retrieve).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());
                institutionsApi.retrieve('some-id');
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /institutions/some-id', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/institutions/some-id');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });
        });
    });
});

