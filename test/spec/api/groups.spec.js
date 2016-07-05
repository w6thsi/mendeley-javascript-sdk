'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');

describe('groups api', function() {

    var api = require('../../../lib/api');
    var groupApi = api.groups;
    var baseUrl = 'https://api.mendeley.com';

    var mockAuth = require('../../mocks/auth');
    api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

    describe('list method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            limit: 500
        };

        it('be defined', function(done) {
            expect(typeof groupApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));

            groupApi.list(params).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /groups/', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/groups/');
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

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof groupApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            groupApi.retrieve(123).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /groups/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/groups/123');
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

    describe('pagination', function() {
        var linkNext = baseUrl + '/groups/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359',
        linkLast = baseUrl + '/groups/?limit=5&reverse=true';

        function ajaxSpy() {
            return spyOn(axios, 'request').and.returnValue(Bluebird.resolve({
                data: [],
                headers: {
                    link: ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', '),
                    'mendeley-count': 56
                }
            }));
        }

        it('should parse link headers', function(done) {
            ajaxSpy();
            groupApi.paginationLinks.next = 'nonsense';
            groupApi.paginationLinks.prev = 'nonsense';
            groupApi.paginationLinks.last = 'nonsense';

            groupApi.list().finally(function() {
                expect(groupApi.paginationLinks.next).toEqual(linkNext);
                expect(groupApi.paginationLinks.last).toEqual(linkLast);
                expect(groupApi.paginationLinks.prev).toEqual(false);
                done();
            });

        });

        it('should get correct link on nextPage()', function(done) {
            var spy = ajaxSpy();
            groupApi.nextPage().finally(function() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
                done();
            });
        });

        it('should get correct link on lastPage()', function(done) {
            var spy = ajaxSpy();
            groupApi.lastPage().finally(function() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
                done();
            });
        });

        it('should fail if no link for rel', function(done) {
            var spy = ajaxSpy();
            groupApi.previousPage().catch(function() {
                expect(spy).not.toHaveBeenCalled();
                done();
            });
        });

        it('should store the total document count', function(done) {
            ajaxSpy();
            groupApi.list().finally(function() {
                expect(groupApi.count).toEqual(56);
                done();
            });
        });

        it('should not break when you GET something else that does not have pagination links', function(done) {
            ajaxSpy();

            groupApi.list().finally(function() {
                expect(groupApi.paginationLinks.next).toEqual(linkNext);
                expect(groupApi.paginationLinks.last).toEqual(linkLast);
                expect(groupApi.paginationLinks.prev).toEqual(false);
                done();
            });
        });
    });
});
