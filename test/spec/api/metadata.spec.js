/* jshint sub: true */
'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');

describe('metadata api', function() {

    var api = require('../../../').API;
    var metadataApi = api.metadata;
    var baseUrl = 'https://api.mendeley.com';

    var mockAuth = require('../../mocks/auth');
    api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            filehash: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d' // SHA1('hello')
        };

        it('should be defined', function(done) {
            expect(typeof metadataApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            metadataApi.retrieve(params).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /metadata', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/metadata');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have a Accept header', function() {
            expect(ajaxRequest.headers['Accept']).toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should allow paramaters', function() {
            expect(ajaxRequest.params).toEqual(params);
        });

    });

});
/* jshint sub: false */
