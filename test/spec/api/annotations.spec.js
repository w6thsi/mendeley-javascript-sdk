/* jshint camelcase: false */
define(function(require) {

    'use strict';

    require('es5-shim');

    describe('annotations api', function() {

        var api = require('api');
        var annotationsApi = api.annotations;
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
                expect(typeof annotationsApi.list).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());

                annotationsApi.list(params);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /annotations/', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/annotations/');
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
                expect(typeof annotationsApi.retrieve).toBe('function');
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
                annotationsApi.retrieve(123);
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            });

            it('should use GET', function() {
                expect(ajaxRequest.type).toBe('GET');
            });

            it('should use endpoint /annotations/{id}', function() {
                expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
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

        describe('create method', function() {
        	var ajaxSpy, ajaxRequest;

        	it('should be defined', function() {
        		expect(typeof annotationsApi.create).toBe('function');
        		ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
        		annotationsApi.create({document_id: 123, text: 'new annotation'});
        		expect(ajaxSpy).toHaveBeenCalled();
        		ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
        	});

        	it('should use POST', function() {
        		expect(ajaxRequest.type).toBe('POST');
        	});

        	it('should use endpoint https://api.mendeley.com/annotations/', function() {
        		expect(ajaxRequest.url).toBe(baseUrl + '/annotations/');
        	});

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of JSON string', function() {
                expect(ajaxRequest.data).toBe('{"document_id":123,"text":"new annotation"}');
            });

        });

        describe('delete method', function() {
        	var ajaxSpy, ajaxRequest;

        	it('should be defined', function() {
        		expect(typeof annotationsApi.delete).toBe('function');
        		ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
        		annotationsApi.delete(123);
                expect(ajaxSpy).toHaveBeenCalled();
        		ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
        	});

        	it('should use DELETE', function() {
        		expect(ajaxRequest.type).toBe('DELETE');
        	});

        	it('should use endpoint https://api.mendeley.com/annotations/{annotation_id}', function() {
        		expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
        	});

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should not have a response body', function() {
                expect(ajaxRequest.data).toBeUndefined;
            });

        });

        describe('patch method', function() {
        	var ajaxSpy, ajaxRequest;

        	it('should be defined', function() {
        		expect(typeof annotationsApi.patch).toBe('function');
        		ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
        		annotationsApi.patch(123, {text: 'updated annotation'});
                expect(ajaxSpy).toHaveBeenCalled();
        		ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
        	});

        	it('should use PATCH', function() {
        		expect(ajaxRequest.type).toBe('PATCH');
        	});

        	it('should use endpoint https://api.mendeley.com/annotations/{annotation_id}', function() {
        		expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
        	});

            it('should have a Content-Type header', function() {
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
            });

            it('should have an Authorization header', function() {
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
            });

            it('should have a body of JSON', function() {
                expect(ajaxRequest.data).toBe('{"text":"updated annotation"}');
            });

        });

        describe('pagination', function() {

            var sendMendeleyCountHeader = true,
            groupCount = 56,
            sendLinks = true,
            linkNext = baseUrl + '/annotations/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359',
            linkLast = baseUrl + '/annotations/?limit=5&reverse=true';

            function ajaxSpy() {
                return spyOn($, 'ajax').and.returnValue($.Deferred().resolve([], 'success', {
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
                annotationsApi.paginationLinks.next = 'nonsense';
                annotationsApi.paginationLinks.prev = 'nonsense';
                annotationsApi.paginationLinks.last = 'nonsense';

                annotationsApi.list();

                expect(annotationsApi.paginationLinks.next).toEqual(linkNext);
                expect(annotationsApi.paginationLinks.last).toEqual(linkLast);
                expect(annotationsApi.paginationLinks.prev).toEqual(false);
            });

            it('should get correct link on nextPage()', function() {
                var spy = ajaxSpy();
                annotationsApi.nextPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
            });

            it('should get correct link on lastPage()', function() {
                var spy = ajaxSpy();
                annotationsApi.lastPage();
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
            });

            it('should fail if no link for rel', function() {
                var spy = ajaxSpy();
                var result = annotationsApi.previousPage();
                expect(result.state()).toEqual('rejected');
                expect(spy).not.toHaveBeenCalled();
            });

            it('should store the total document count', function() {
                ajaxSpy();
                annotationsApi.list();
                expect(annotationsApi.count).toEqual(56);

                sendMendeleyCountHeader = false;
                groupCount = 999;
                annotationsApi.list();
                expect(annotationsApi.count).toEqual(56);

                sendMendeleyCountHeader = true;
                groupCount = 0;
                annotationsApi.list();
                expect(annotationsApi.count).toEqual(0);
            });

            it('should not break when you GET something else that does not have pagination links', function() {

                ajaxSpy();

                annotationsApi.list();

                expect(annotationsApi.paginationLinks.next).toEqual(linkNext);
                expect(annotationsApi.paginationLinks.last).toEqual(linkLast);
                expect(annotationsApi.paginationLinks.prev).toEqual(false);

                sendLinks = false;
                annotationsApi.retrieve(56);
                expect(annotationsApi.paginationLinks.next).toEqual(linkNext);
                expect(annotationsApi.paginationLinks.last).toEqual(linkLast);
                expect(annotationsApi.paginationLinks.prev).toEqual(false);

            });
        });
    });
});
/* jshint camelcase: true */