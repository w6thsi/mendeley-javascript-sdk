define(function(require) {

    'use strict';

    var Promise = require('bluebird');
    var axios = require('axios');
    require('es5-shim');

    describe('groups api', function() {

        var api = require('api');
        var groupApi = api.groups;
        var baseUrl = 'https://api.mendeley.com';

        var mockAuth = require('mocks/auth');
        api.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('list method', function() {

            var ajaxSpy;
            var ajaxRequest;
            var params = {
                limit: 500
            };

            it('be defined', function() {
                expect(typeof groupApi.list).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());

                groupApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
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
                expect(ajaxRequest.data).toEqual(params);
            });
        });

        describe('retrieve method', function() {

            var ajaxSpy;
            var ajaxRequest;

            it('should be defined', function() {
                expect(typeof groupApi.retrieve).toBe('function');
                ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve());
                groupApi.retrieve(123);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
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

            var sendMendeleyCountHeader = true,
            groupCount = 56,
            sendLinks = true,
            linkNext = baseUrl + '/groups/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359',
            linkLast = baseUrl + '/groups/?limit=5&reverse=true';

            function ajaxSpy() {
                return spyOn(axios, 'request').and.returnValue(Promise.resolve([], 'success', {
                    getResponseHeader: function(headerName) {
                        if (headerName === 'Link' && sendLinks) {
                            return ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', ');
                        } else if (headerName === 'Mendeley-Count' && sendMendeleyCountHeader) {
                            return groupCount.toString();
                        }

                        return null;
                    },
                    getAllResponseHeaders: function() {
                        return ['Link: <' + linkNext + '>; rel="next"', 'Link: <' + linkLast + '>; rel="last"'].join('\n');
                    }
                }));
            }

            it('should parse link headers', function() {
                ajaxSpy();
                groupApi.paginationLinks.next = 'nonsense';
                groupApi.paginationLinks.prev = 'nonsense';
                groupApi.paginationLinks.last = 'nonsense';

                groupApi.list();

                expect(groupApi.paginationLinks.next).toEqual(linkNext);
                expect(groupApi.paginationLinks.last).toEqual(linkLast);
                expect(groupApi.paginationLinks.prev).toEqual(false);
            });

            it('should get correct link on nextPage()', function() {
                var spy = ajaxSpy();
                groupApi.nextPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
            });

            it('should get correct link on lastPage()', function() {
                var spy = ajaxSpy();
                groupApi.lastPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
            });

            it('should fail if no link for rel', function() {
                var spy = ajaxSpy();
                var result = groupApi.previousPage();
                expect(result.state()).toEqual('rejected');
                expect(spy).not.toHaveBeenCalled();
            });

            it('should store the total document count', function() {
                ajaxSpy();
                groupApi.list();
                expect(groupApi.count).toEqual(56);

                sendMendeleyCountHeader = false;
                groupCount = 999;
                groupApi.list();
                expect(groupApi.count).toEqual(56);

                sendMendeleyCountHeader = true;
                groupCount = 0;
                groupApi.list();
                expect(groupApi.count).toEqual(0);
            });

            it('should not break when you GET something else that does not have pagination links', function() {

                ajaxSpy();

                groupApi.list();

                expect(groupApi.paginationLinks.next).toEqual(linkNext);
                expect(groupApi.paginationLinks.last).toEqual(linkLast);
                expect(groupApi.paginationLinks.prev).toEqual(false);

                sendLinks = false;
                groupApi.retrieve(56);
                expect(groupApi.paginationLinks.next).toEqual(linkNext);
                expect(groupApi.paginationLinks.last).toEqual(linkLast);
                expect(groupApi.paginationLinks.prev).toEqual(false);

            });
        });
    });
});
