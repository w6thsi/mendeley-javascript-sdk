/* jshint camelcase: false */
define(function(require) {

    'use strict';

    require('es5-shim');

    describe('profiles api', function() {

        var api = require('api');
        var profilesApi = api.profiles;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        // Mock methods for getting headers
        var getResponseHeaderLocation = function(header) {
            return header === 'Location' ? baseUrl + '/profiles/me' : null;
        };

        var getAllResponseHeaders = function() {
            return '';
        };

        var mockPromiseUpdate = $.Deferred().resolve([], 1, {
            status: 200,
            getResponseHeader: getResponseHeaderLocation,
            getAllResponseHeaders: getAllResponseHeaders
        }).promise();

        // Get a function to return promises in order
        function getMockPromises() {
            var responses = Array.prototype.slice.call(arguments);
            var calls = 0;
            return function() {
                return responses[calls++];
            };
        }

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

            it('should NOT have a Content-Type header', function() {
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

        describe('update method', function() {

            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof profilesApi.update).toBe('function');
                var ajaxSpy = spyOn($, 'ajax').and.callFake(getMockPromises(mockPromiseUpdate));
                profilesApi.update({first_name: 'John', last_name: 'Doe'});
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use PATCH', function() {
                expect(ajaxRequest.type).toBe('PATCH');
            });

            it('should use endpoint /profiles/me', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/profiles/me');
            });

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of JSON string', function() {
                expect(ajaxRequest.data).toBe('{"first_name":"John","last_name":"Doe"}');
            });

        });

    });

});
/* jshint camelcase: true */
