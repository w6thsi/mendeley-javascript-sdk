define(function(require) {

    'use strict';

    require('es5-shim');

    describe('followers api', function() {

        var api = require('api');
        var followersApi = api.followers;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('follow method', function() {
            var ajaxSpy;
            var ajaxRequest;
            var params = {
                followed: 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0'
            };

            it('should be defined', function() {
                expect(typeof followersApi.follow).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                followersApi.follow(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use POST', function() {
                expect(ajaxRequest.type).toBe('POST');
            });

            it('should use endpoint /followers', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/followers');
            });

            it('should have a have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toEqual('application/vnd.mendeley-follow-request.1+json');
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should allow paramaters', function() {
                expect(ajaxRequest.data).toEqual('{"followed":"c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0"}');
            });

        });
    });
});
