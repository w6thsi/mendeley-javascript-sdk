'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');

describe('institution trees api', function() {

    var api = require('../../../').API;
    var institutionTreesApi = api.institutionTrees;
    var baseUrl = 'https://api.mendeley.com';

    var mockAuth = require('../../mocks/auth');
    api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

    describe('list method', function() {
        /* jshint camelcase: false */
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            institution_id: '123'
        };

        beforeEach(function(done) {
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            institutionTreesApi.list(params).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should be defined', function() {
            expect(typeof institutionTreesApi.list).toBe('function');
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /institution_trees', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/institution_trees');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should allow parameters', function() {
            expect(ajaxRequest.params).toEqual(params);
        });

    });

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        beforeEach(function(done) {
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            institutionTreesApi.retrieve('123').finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should be defined', function() {
            expect(typeof institutionTreesApi.retrieve).toBe('function');
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /institution_trees/123', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/institution_trees/123');
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
