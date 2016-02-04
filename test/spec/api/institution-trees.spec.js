define(function(require) {

    'use strict';

    require('es5-shim');

    describe('institution trees api', function() {

        var api = require('api');
        var institutionTreesApi = api.institutionTrees;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('list method', function() {
            var ajaxSpy;
            var ajaxRequest;
            var params = {
                institution_id: '123'
            };
            
             beforeEach(function() {
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                institutionTreesApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should be defined', function() {
                expect(typeof institutionTreesApi.list).toBe('function');
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
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
                expect(ajaxRequest.data).toEqual(params);
            });

        });

        describe('retrieve method', function() {
            var ajaxSpy;
            var ajaxRequest;
            
            beforeEach(function() {
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                institutionTreesApi.retrieve('123');
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should be defined', function() {
                expect(typeof institutionTreesApi.retrieve).toBe('function');
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
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
});

