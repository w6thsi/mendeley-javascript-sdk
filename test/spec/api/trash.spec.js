'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');

describe('trash api', function() {

    var api = require('../../../').API;
    var trashApi = api.trash;
    var baseUrl = 'https://api.mendeley.com';

    var mockAuth = require('../../mocks/auth');
    api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof trashApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            trashApi.retrieve(15).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /trash/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash/15');
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

    describe('list method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var sampleData = {
            sort: 'created',
            order: 'desc',
            limit: 50
        };

        it('be defined', function(done) {
            expect(typeof trashApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));

            trashApi.list(sampleData).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /trash', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should apply request params', function() {
            expect(ajaxRequest.params).toEqual(sampleData);
        });
    });

    describe('restore method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof trashApi.restore).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            trashApi.restore(15).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint /trash/{id}/restore', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash/15/restore');
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

    describe('restore method failures', function() {
        it('should reject restore errors with the response', function(done) {
            var ajaxFailureResponse = function() {
                return Bluebird.reject({ response: { status: 404 } });
            };
            spyOn(axios, 'request').and.callFake(ajaxFailureResponse);
            trashApi.restore().catch(function(error) {
                expect(error.response.status).toEqual(404);
                done();
            });
        });
    });

    describe('destroy method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof trashApi.destroy).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.resolve({headers: {}}));
            trashApi.destroy(15).finally(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            });
        });

        it('should use DELETE', function() {
            expect(ajaxRequest.method).toBe('delete');
        });

        it('should use endpoint /trash/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash/15');
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
        var sendMendeleyCountHeader = true,
            documentCount = 155,
            sendLinks = true,
            linkNext = baseUrl + '/trash/?limit=5&reverse=false&sort=created&order=desc&marker=03726a18-140d-3e79-9c2f-b63473668359',
            linkLast = baseUrl + '/trash/?limit=5&reverse=true&sort=created&order=desc';

        function ajaxSpy() {
            var headers = {
                data: [],
                status: 200
            };
            var spy = jasmine.createSpy('axios');

            if (sendMendeleyCountHeader) {
                headers['mendeley-count'] = documentCount.toString();
            }

            if (sendLinks) {
                headers.link = ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', ');
            }

            spy.and.returnValue(Bluebird.resolve({
                headers: headers
            }));
            axios.request = spy;

            return spy;
        }

        it('should parse link headers', function(done) {
            ajaxSpy();

            trashApi.list()
            .then(function (trash) {
                expect(trash.nextPage).toEqual(jasmine.any(Function));
                expect(trash.lastPage).toEqual(jasmine.any(Function));
                expect(trash.previousPage).toEqual(undefined);
                done();
            });
        });

        it('should get correct link on nextPage()', function(done) {
            var spy = ajaxSpy();

            trashApi.list().then(function(trash) {
                return trash.nextPage();
            })
            .finally(function() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
                done();
            });
        });

        it('should get correct link on lastPage()', function(done) {
            var spy = ajaxSpy();

            trashApi.list().then(function(trash) {
                return trash.lastPage();
            })
            .finally(function() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
                done();
            });
        });

        it('should store the total trashed documents count', function(done) {
            ajaxSpy();

            trashApi.list()
            .then(function(trash) {
                expect(trash.total).toEqual(155);
                done();
            });
        });
    });
});
