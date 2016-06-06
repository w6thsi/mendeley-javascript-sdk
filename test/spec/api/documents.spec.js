define(function(require) {

    'use strict';

    var axios = require('axios');
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

    describe('documents api', function() {

        var api = require('api');
        var documentsApi = api.documents;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        // Mock ajax response promises
        var mockPromiseCreate = Promise.resolve({
            data: '',
            status: 201,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseRetrieve = Promise.resolve({
            data: { id: '15', title: 'foo' },
            status: 200,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseCreateFromFile = Promise.resolve({
            data: { id: '15', title: 'foo' },
            status: 201,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseUpdate = Promise.resolve({
            data: { id: '15', title: 'foo' },
            status: 200,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseClone = Promise.resolve({
            data: {  id: '16', title: 'foo', 'group_id': 'bar' },
            status: 200,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseList = Promise.resolve({
            data: [{ id: '15', title: 'foo' }],
            status: 200,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseTrash = Promise.resolve({
            data: null,
            status: 204,
            headers: {
                'location': baseUrl + '/documents/123'
            }
        });

        var mockPromiseNotFound = Promise.reject({ status: 404 });

        var mockPromiseInternalError = Promise.reject({ status: 500 });

        var mockPromiseGatewayTimeout = Promise.reject({ status: 504 });

        // Get a function to return promises in order
        function getMockPromises() {
            var responses = Array.prototype.slice.call(arguments);
            var calls = 0;
            return function() {
                return responses[calls++];
            };
        }

        describe('create method', function() {

            var ajaxSpy;
            var ajaxRequest;

            beforeEach(function() {
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreate, mockPromiseRetrieve));
            });

            it('should be defined', function() {
                expect(typeof documentsApi.create).toBe('function');
                documentsApi.create({ title: 'foo' });
                expect(ajaxSpy).toHaveBeenCalled();
            });

            it('should use POST', function() {
                documentsApi.create({ title: 'foo' });
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.method).toBe('post');
            });

            it('should use endpoint /documents', function() {
                documentsApi.create({ title: 'foo' });
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.url).toBe(baseUrl + '/documents');
            });

            it('should have a Content-Type header', function() {
                documentsApi.create({ title: 'foo' });
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                documentsApi.create({ title: 'foo' });
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of JSON string', function() {
                documentsApi.create({ title: 'foo' });
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.data).toBe('{"title":"foo"}');
            });

            it('should follow Location header', function(done) {
                documentsApi.create({ title: 'foo' }).finally(function() {
                    ajaxRequest = ajaxSpy.calls.first().args[0];
                    var ajaxRedirect = ajaxSpy.calls.mostRecent().args[0];
                    expect(ajaxRedirect.method).toBe('get');
                    expect(ajaxRedirect.url).toBe(baseUrl + '/documents/123');
                    done();
                });
            });

            it('should resolve with the response', function(done) {
                documentsApi.create({ title: 'foo' }).then(function(data) {
                    expect(data).toEqual({ id: '15', title: 'foo' });
                    done();
                });
            });
        });

        describe('create method failures', function() {

            it('should reject create errors with the request and response', function(done) {
                spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseInternalError));
                documentsApi.create({ title: 'foo' }).catch(function(response) {
                    expect(response.status).toEqual(500);
                    done();
                });
            });

            it('should fail redirect errors with the request and the response', function(done) {
                spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreate, mockPromiseNotFound));
                documentsApi.create({ title: 'foo' }).catch(function(response) {
                    expect(response.status).toEqual(404);
                    done();
                });
            });
        });

        describe('createFromFile method', function() {

            var ajaxSpy;
            var apiRequest;
            var ajaxRequest;
            var file = getBlob('hello', 'text/plain');
            file.name = '中文file name(1).pdf';

            it('should be defined', function() {
                expect(typeof documentsApi.createFromFile).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreateFromFile));
                apiRequest = documentsApi.createFromFile(file);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.first().args[0];
            });

            it('should use POST', function() {
                expect(ajaxRequest.method).toBe('post');
            });

            it('should use endpoint /documents', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/documents');
            });

            it('should have a Content-Type header the same as the file', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
                expect(ajaxRequest.headers['Content-Type']).toEqual('text/plain');
            });

            it('should have a Content-Disposition header based on file name', function() {
                expect(ajaxRequest.headers['Content-Disposition']).toEqual('attachment; filename*=UTF-8\'\'%E4%B8%AD%E6%96%87file%20name%281%29.pdf');
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of the file contents', function() {
                expect(ajaxRequest.data).toEqual(file);
            });

            it('should resolve with the response', function(done) {
                apiRequest.then(function(data) {
                    expect(data).toEqual({ id: '15', title: 'foo' });
                    done();
                });
            });
        });

        describe('createFromFileInGroup method', function() {

            var ajaxSpy;
            var apiRequest;
            var ajaxRequest;
            var file = getBlob('hello', 'text/plain');
            file.name = '中文file name(1).pdf';

            it('should be defined', function() {
                expect(typeof documentsApi.createFromFile).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreateFromFile));
                apiRequest = documentsApi.createFromFileInGroup(file, 123);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.first().args[0];
            });

            it('should have a Link header', function() {
                expect(ajaxRequest.headers.Link).toBe('<' + baseUrl + '/groups/123>; rel="group"');
            });
        });

        describe('retrieve method', function() {

            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof documentsApi.retrieve).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseRetrieve));
                documentsApi.retrieve(15);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.method).toBe('get');
            });

            it('should use endpoint /documents/{id}/', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/documents/15');
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

        describe('retrieve method failures', function() {

            it('should reject retrieve errors with the request and response', function(done) {
                spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseNotFound));
                documentsApi.list().catch(function(response) {
                    expect(response.status).toEqual(404);
                    done();
                });
            });

        });

        describe('update method', function() {

            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof documentsApi.update).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseUpdate));
                documentsApi.update(15, { title: 'bar' });
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use PATCH', function() {
                expect(ajaxRequest.method).toBe('patch');
            });

            it('should use endpoint /documents/{id}/', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/documents/15');
            });

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of JSON string', function() {
                expect(ajaxRequest.data).toBe('{"title":"bar"}');
            });

        });

        describe('clone method', function() {

            var ajaxRequest,
                apiRequest;

            it('should be defined', function() {
                expect(typeof documentsApi.clone).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseClone));
                apiRequest = documentsApi.clone(15, { 'group_id': 'bar' });
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use POST', function() {
                expect(ajaxRequest.method).toBe('post');
            });

            it('should use endpoint /documents/{id}/actions/cloneTo', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/documents/15/actions/cloneTo');
            });

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of JSON string', function() {
                expect(ajaxRequest.data).toBe('{"group_id":"bar"}');
            });

            it('should resolve with the response', function(done) {
                apiRequest.then(function(data) {
                    expect(data).toEqual({ id : '16', title : 'foo', 'group_id' : 'bar' });
                    done();
                });
            });
        });

        describe('list method', function() {

            var ajaxRequest;
            var params = {
                sort: 'created',
                order: 'desc',
                limit: 50
            };

            it('should be defined', function() {
                expect(typeof documentsApi.list).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseList));

                documentsApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.method).toBe('get');
            });

            it('should use endpoint /documents/', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/documents/');
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

        describe('list with folderId param', function() {

            var ajaxRequest;
            var params = {
                sort: 'created',
                order: 'desc',
                limit: 50,
                folderId: 'xyz'
            };

            it('should use the folders API', function() {
                var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseList));
                documentsApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.method).toBe('get');
            });

            it('should use endpoint /folders/{id}/documents', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/folders/xyz/documents');
            });

            it('should remove the all paramaters except limit', function() {
                expect(ajaxRequest.params).toEqual({limit: 50});
            });

        });

        describe('trash method', function() {

            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof documentsApi.trash).toBe('function');
                var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseTrash));
                documentsApi.trash(15);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use POST', function() {
                expect(ajaxRequest.method).toBe('post');
            });

            it('should use endpoint /documents/{id}/trash', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/documents/15/trash');
            });

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should NOT have a body', function() {
                expect(ajaxRequest.data).toBeUndefined();
            });

        });

        describe('retry', function() {

            var ajaxSpy;

            it('should retry on 504', function(done) {
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseGatewayTimeout, mockPromiseList));
                documentsApi.list().finally(function() {
                    expect(ajaxSpy).toHaveBeenCalled();
                    expect(ajaxSpy.calls.count()).toBe(2);
                    done();
                });
            });

            it('should only retry once', function(done) {
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseGatewayTimeout, mockPromiseGatewayTimeout, mockPromiseList));
                documentsApi.list().finally(function() {
                    expect(ajaxSpy).toHaveBeenCalled();
                    expect(ajaxSpy.calls.count()).toBe(2);
                    done();
                });
            });

            it('should NOT retry on response != 504', function(done) {
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseNotFound, mockPromiseList));
                documentsApi.list().finally(function() {
                    expect(ajaxSpy).toHaveBeenCalled();
                    expect(ajaxSpy.calls.count()).toBe(1);
                    done();
                });
            });

            it('should NOT retry on failed create', function(done) {
                ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseInternalError, mockPromiseList));
                documentsApi.create({ title: 'foo' }).finally(function() {
                    expect(ajaxSpy).toHaveBeenCalled();
                    expect(ajaxSpy.calls.count()).toBe(1);
                    done();
                });
            });
        });

        describe('pagination', function() {

            var sendMendeleyCountHeader = true,
            documentCount = 155,
            sendLinks = true,
            linkNext = baseUrl + '/documents/?limit=5&reverse=false&sort=created&order=desc&marker=03726a18-140d-3e79-9c2f-b63473668359',
            linkPrev = baseUrl + '/documents/?limit=5&reverse=false&sort=created&order=desc&marker=13726a18-140d-3e79-9c2f-b63473668359',
            linkLast = baseUrl + '/documents/?limit=5&reverse=true&sort=created&order=desc';

            function ajaxSpy() {
                var headers = {};
                var spy = jasmine.createSpy('axios');

                if (sendMendeleyCountHeader) {
                    headers['mendeley-count'] = documentCount.toString();
                }

                if (sendLinks) {
                    headers.link = ['<' + linkNext + '>; rel="next"', '<' + linkPrev + '>; rel="previous"', '<' + linkLast + '>; rel="last"'].join(', ');
                }

                spy.and.returnValue(Promise.resolve({
                    headers: headers
                }));
                axios.request = spy;

                return spy;
            }

            it('should parse link headers', function(done) {
                ajaxSpy();
                documentsApi.paginationLinks.next = 'nonsense';
                documentsApi.paginationLinks.previous = 'nonsense';
                documentsApi.paginationLinks.last = 'nonsense';

                documentsApi.list().finally(function() {
                    expect(documentsApi.paginationLinks.next).toEqual(linkNext);
                    expect(documentsApi.paginationLinks.last).toEqual(linkLast);
                    expect(documentsApi.paginationLinks.previous).toEqual(linkPrev);
                    done();
                });
            });

            it('should get correct link on nextPage()', function() {
                var spy = ajaxSpy();
                documentsApi.nextPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
            });

            it('should get correct link on previousPage()', function() {
                var spy = ajaxSpy();
                documentsApi.previousPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkPrev);
            });

            it('should get correct link on lastPage()', function() {
                var spy = ajaxSpy();
                documentsApi.lastPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
            });

            it('should fail if no link for rel', function() {
                documentsApi.resetPagination();
                var spy = ajaxSpy();
                var result = documentsApi.previousPage();
                expect(result.isRejected()).toEqual(true);
                expect(spy).not.toHaveBeenCalled();
            });

            it('should store the total document count', function(done) {
                ajaxSpy();
                documentsApi.list().finally(function() {
                    expect(documentsApi.count).toEqual(155);
                    
                    sendMendeleyCountHeader = false;
                    documentCount = 999;
                    ajaxSpy();
                    return documentsApi.list();
                }).finally(function() {
                    expect(documentsApi.count).toEqual(155);

                    sendMendeleyCountHeader = true;
                    documentCount = 0;
                    ajaxSpy();
                    return documentsApi.list();
                }).finally(function() {
                    expect(documentsApi.count).toEqual(0);
                    done();
                });
            });

            it('should not break when you GET something else that does not have pagination links', function(done) {
                ajaxSpy();

                documentsApi.list().finally(function() {
                    expect(documentsApi.paginationLinks.next).toEqual(linkNext);
                    expect(documentsApi.paginationLinks.last).toEqual(linkLast);
                    expect(documentsApi.paginationLinks.previous).toEqual(linkPrev);
                    
                    sendLinks = false;
                    ajaxSpy();
                    return documentsApi.retrieve(155);
                }).finally(function() {
                    expect(documentsApi.paginationLinks.next).toEqual(linkNext);
                    expect(documentsApi.paginationLinks.last).toEqual(linkLast);
                    expect(documentsApi.paginationLinks.previous).toEqual(linkPrev);
                    done();
                });
            });

            it('should be possible to reset the pagination links manually', function(done) {
                ajaxSpy();

                documentsApi.list().finally(function() {
                    expect(documentsApi.paginationLinks.next).toEqual(linkNext);
                    expect(documentsApi.paginationLinks.last).toEqual(linkLast);
                    expect(documentsApi.paginationLinks.previous).toEqual(linkPrev);
                    
                    documentsApi.resetPagination();

                    expect(documentsApi.paginationLinks.next).toEqual(false);
                    expect(documentsApi.paginationLinks.last).toEqual(false);
                    expect(documentsApi.paginationLinks.previous).toEqual(false);

                    done();
                });
            });

            it('should not set pagination links if there is a count but no links', function(done) {
                sendMendeleyCountHeader = true;
                documentCount = 10;
                sendLinks = false;

                ajaxSpy();

                documentsApi.list().finally(function() {
                    expect(documentsApi.count).toEqual(10);
                    expect(documentsApi.paginationLinks.next).toEqual(false);
                    expect(documentsApi.paginationLinks.last).toEqual(false);
                    expect(documentsApi.paginationLinks.previous).toEqual(false);
                    done();
                });

            });
        });
    });
});
