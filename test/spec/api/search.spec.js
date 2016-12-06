'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');
describe('search api', function() {
    var searchApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).search;

    describe('catalog method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
          title: 'Quantum Computation with Quantum Dots'
        };

        beforeEach(function(done) {
          ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
          searchApi.catalog(params).finally(function() {
              expect(ajaxSpy).toHaveBeenCalled();
              ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
              done();
          });
        });

        it('should be defined', function() {
          expect(typeof searchApi.catalog).toBe('function');
        });

        it('should use GET', function() {
          expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /search/catalog/{title}', function() {
          expect(ajaxRequest.url).toBe(baseUrl + '/search/catalog');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
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
