define(function(require) {

    'use strict';

    var Promise = require('bluebird');
    var axios = require('axios');
    require('es5-shim');

    describe('followers api', function() {

        var api = require('api');
        var followersApi = api.followers;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('create method', function() {
            var ajaxSpy;
            var ajaxRequest;
            var params = {
                followed: 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0'
            };

            it('should be defined', function() {
                expect(typeof followersApi.create).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());
                followersApi.create(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use POST', function() {
                expect(ajaxRequest.method).toBe('post');
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

        describe('list method', function() {

            var ajaxRequest;
            var params = {
                follower: 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0',
                limit: 50
            };

            it('should be defined', function() {
                expect(typeof followersApi.list).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());

                followersApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.method).toBe('get');
            });

            it('should use endpoint /followers', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/followers');
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should apply request params', function() {
                expect(ajaxRequest.params).toEqual(params);
            });

        });

        describe('remove method', function() {

            var ajaxRequest;
            var relationshipId = 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0';

            it('should be defined', function() {
                expect(typeof followersApi.remove).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());

                followersApi.remove(relationshipId);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use DELETE', function() {
                expect(ajaxRequest.method).toBe('delete');
            });

            it('should use endpoint /followers/{id}', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/followers/' + relationshipId);
            });

            it('should NOT have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

        });

        describe('accept method', function() {

            var ajaxRequest;
            var relationshipId = 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0';

            it('should be defined', function() {
                expect(typeof followersApi.accept).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());

                followersApi.accept(relationshipId, { status: 'following' });
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use PATCH', function() {
                expect(ajaxRequest.method).toBe('patch');
            });

            it('should use endpoint /followers/{id}', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/followers/' + relationshipId);
            });

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

        });
    });
});
