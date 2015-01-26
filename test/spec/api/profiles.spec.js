define(function(require) {

    'use strict';

    require('es5-shim');

    describe('profiles api', function() {

        var api = require('api');
        var profilesApi = api.profiles;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('me method', function() {

            var ajaxSpy;
            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof profilesApi.me).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                profilesApi.me();
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /profiles/me', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/profiles/me');
            });

            it('should have a NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should NOT have a body', function() {
                expect(ajaxRequest.data).toBeUndefined();
            });

        });

    });

});
