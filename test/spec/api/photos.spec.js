define(function(require) {

    'use strict';

    require('es5-shim');

    // Helper for getting a file blob in phantom vs. others
    function getBlob(content, type) {
        if (typeof window.WebKitBlobBuilder !== 'undefined') {
            var builder = new window.WebKitBlobBuilder();
            builder.append(content);
            return builder.getBlob(type);
        }
        return new Blob([content], { type: type });
    }

    describe('photos api', function() {

        var api = require('api');
        var photosApi = api.photos;
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

        var mockPromiseCreateFromFile = $.Deferred().resolve(null, 1, {
            status: 201,
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
            var apiRequest;
            var ajaxRequest;
            var file = getBlob('photo content', 'image/png');
            file.name = '中文file name(1).png';

            it('should be defined', function() {
                expect(typeof photosApi.me).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.callFake(getMockPromises(mockPromiseCreateFromFile));
                apiRequest = photosApi.me(file);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.first().args[0];
            });

            it('should use POST', function() {
                expect(ajaxRequest.type).toBe('POST');
            });

            it('should use endpoint /photos/me', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/photos/me');
            });

            it('should have a Content-Type header the same as the file', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
                expect(ajaxRequest.headers['Content-Type']).toEqual('image/png');
            });

            it('should have a Content-Disposition header based on file name', function() {
                expect(ajaxRequest.headers['Content-Disposition']).toEqual('attachment; filename*=UTF-8\'\'%E4%B8%AD%E6%96%87file%20name%281%29.png');
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of the file contents', function() {
                expect(ajaxRequest.data).toEqual(file);
            });

        });

    });

});
