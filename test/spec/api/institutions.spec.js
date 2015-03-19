define(function(require) {

    'use strict';

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
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
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

            it('should have a NOT have a Content-Type header', function() {
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
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                institutionsApi.retrieve('UUID');
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /institutions/UUID', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/institutions/UUID');
            });

            it('should have a NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });
        });
    });
});

