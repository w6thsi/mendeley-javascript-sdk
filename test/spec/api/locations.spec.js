define(function(require) {

    'use strict';

    var Promise = require('bluebird');
    var axios = require('axios');
    require('es5-shim');

    describe('locations api', function() {

        var api = require('api');
        var locationsApi = api.locations;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('search method', function() {
            var ajaxSpy;
            var ajaxRequest;
            var params = {
                prefix: 'lon',
                limit: 10
            };

            it('should be defined', function() {
                expect(typeof locationsApi.search).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());
                locationsApi.search(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /locations', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/locations');
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
                expect(typeof locationsApi.retrieve).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());
                locationsApi.retrieve('some-id');
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /locations/some-id', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/locations/some-id');
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

