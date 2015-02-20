define(function(require) {

    'use strict';

    require('es5-shim');

    // Get a function to return promises in order
    function getMockPromises() {
        var responses = Array.prototype.slice.call(arguments);
        var calls = 0;
        return function() {
            return responses[calls++];
        };
    }

    describe('request', function() {

        var request = require('request');
        var mockAuth = require('mocks/auth');

        it ('should have a request type property', function() {
            var myRequest = request.create({ type: 'GET' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            expect(myRequest.request.type).toBe('GET');
        });

        it ('should have allow setting the type to whatever you like', function() {
            var myRequest = request.create({ type: 'POST' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            expect(myRequest.request.type).toBe('POST');
        });

        describe('authentication', function() {

            it('should add optional accessToken to the Authorization header', function() {
                var myRequest = request.create({ type: 'GET' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    $.Deferred().resolve({}, 1, { status: 200 }).promise()
                );
                spyOn($, 'ajax').and.callFake(fun);

                myRequest.send();

                expect(myRequest.request.headers.Authorization).toEqual('Bearer auth');
            });
        });

        describe('authentication failures', function() {

            it('should try calling authFlow.refreshToken() if using authCodeFlow', function() {
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ type: 'GET' }, { authFlow: mockAuthInterface });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 401 }).promise(), // Auth failure
                    $.Deferred().resolve({}, 1, { status: 200 }).promise() // Original request success
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();

                myRequest.send();

                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(ajaxSpy.calls.count()).toEqual(2);
                expect(ajaxSpy.calls.mostRecent().args[0].headers.Authorization).toEqual('Bearer auth-refreshed');
            });

            it('should fail and call authenticate if cannot refresh token', function(done) {
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ type: 'GET' }, { authFlow: mockAuthInterface });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 401 }).promise(), // Auth failure
                    $.Deferred().resolve({}, 1, { status: 200 }).promise() // Original request success
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue($.Deferred().reject({ status: 500 }));
                var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(authAuthenticateSpy.calls.count()).toEqual(1);
                    done();
                });

            });

            it('should send a notification if cannot refresh token', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ type: 'GET' }, { maxAuthRetries: 2, authFlow: mockAuthInterface }, {notify: mockNotifier});

                var ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().reject({ status: 401 }));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue($.Deferred().reject({ status: 500 }));

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(mockNotifier.calls.count()).toEqual(3);
                    expect(mockNotifier.calls.allArgs()).toEqual([
                        ['startInfo', [ 'GET', undefined ], { type : 'GET', headers : { Authorization : 'Bearer auth' } } ],
                        ['authWarning', [ 401, 1, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 401 } ],
                        ['refreshError', [500], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 500 }  ]
                        ]);
                    done();
                    });
            });

            it('should send a notification if no refresh token defined', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ type: 'GET' }, { maxAuthRetries: 2, authFlow: mockAuthInterface }, {notify: mockNotifier});

                var ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().reject({ status: 401 }));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue(false);

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(mockNotifier.calls.count()).toEqual(3);
                    expect(mockNotifier.calls.allArgs()).toEqual([
                        ['startInfo', [ 'GET', undefined ], { type : 'GET', headers : { Authorization : 'Bearer auth' } } ],
                        ['authWarning', [ 401, 1, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 401 } ],
                        ['refreshNotConfigured', [] ]
                        ]);
                    done();
                    });
            });


            it('should NOT do more than maxAuthRetries', function(done) {
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ type: 'GET' }, { maxAuthRetries: 2, authFlow: mockAuthInterface });

                var ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().reject({ status: 401 }));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
                var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(3);
                    expect(authRefreshSpy.calls.count()).toEqual(2);
                    expect(authAuthenticateSpy.calls.count()).toEqual(1);
                    done();
                });
            });

            it('should send a notification on authorization failure', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ type: 'GET' }, { maxAuthRetries: 2, authFlow: mockAuthInterface }, {notify: mockNotifier});

                var ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().reject({ status: 401 }));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
                var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(3);
                    expect(authRefreshSpy.calls.count()).toEqual(2);
                    expect(authAuthenticateSpy.calls.count()).toEqual(1);

                    expect(mockNotifier.calls.count()).toEqual(4);
                    expect(mockNotifier.calls.allArgs()).toEqual([
                        ['startInfo', [ 'GET', undefined ], { type : 'GET', headers : { Authorization : 'Bearer auth-refreshed' } } ],
                        ['authWarning', [ 401, 1, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth-refreshed' } }, { status : 401 } ],
                        ['authWarning', [ 401, 2, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth-refreshed' } }, { status : 401 } ],
                        ['authError', [ 401, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth-refreshed' } }, { status : 401 } ]
                        ]);
                    done();
                });
            });
        });

        describe('timeout failures', function() {

            it('should NOT retry by default', function() {
                var myRequest = request.create({ type: 'GET' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().resolve({}, 1, { status: 200 }).promise()
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);

                myRequest.send();

                expect(ajaxSpy.calls.count()).toEqual(1);
            });

            it('should allow setting maximum number of retries', function() {
                var myRequest = request.create({ type: 'GET' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().resolve({}, 1, { status: 200 }).promise()
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);

                myRequest.send();

                expect(ajaxSpy.calls.count()).toEqual(2);
            });


            it('should NOT do more than maxRetries', function() {
                var myRequest = request.create({ type: 'GET' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().resolve({}, 1, { status: 200 }).promise()
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);

                myRequest.send();

                expect(ajaxSpy.calls.count()).toEqual(2);
            });

            it('should correctly resolve the original deferred', function(done) {
                var myRequest = request.create({ type: 'GET' }, { maxRetries: 10, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().reject({ status: 504 }).promise(),
                    $.Deferred().resolve({}, 1, { status: 200 }).promise()
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);

                myRequest.send().done(function() {
                    expect(ajaxSpy.calls.count()).toEqual(10);
                    done();
                });
            });

            it('should send a notification on request failure', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var myRequest = request.create({ type: 'GET' }, { maxRetries: 2, authFlow: mockAuth.mockImplicitGrantFlow() }, {notify: mockNotifier});

                var ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().reject({ status: 504 }));

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(3);

                    expect(mockNotifier.calls.count()).toEqual(4);
                    expect(mockNotifier.calls.allArgs()).toEqual([
                        ['startInfo', [ 'GET', undefined ], { type : 'GET', headers : { Authorization : 'Bearer auth' } } ],
                        ['commWarning', [ 504, 1, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 504 } ],
                        ['commWarning', [ 504, 2, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 504 } ],
                        ['commError', [ 504, 2 ], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 504 } ]
                        ]);
                    done();
                });
            });
        });

        describe('generic failures', function() {

            it('should NOT retry on generic errors', function(done) {
                var myRequest = request.create({ type: 'GET' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    $.Deferred().reject({ status: 404 }).promise(),
                    $.Deferred().resolve({}, 1, { status: 200 }).promise()
                );
                var ajaxSpy = spyOn($, 'ajax').and.callFake(fun);

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    done();
                });
            });

            it('should send a notification on request failure', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var myRequest = request.create({ type: 'GET' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() }, {notify: mockNotifier});

                var ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().reject({ status: 404 }));

                myRequest.send().fail(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);

                    expect(mockNotifier.calls.count()).toEqual(2);
                    expect(mockNotifier.calls.allArgs()).toEqual([
                        ['startInfo', [ 'GET', undefined ], { type : 'GET', headers : { Authorization : 'Bearer auth' } } ],
                        ['reqError', [ 404 ], { type : 'GET', headers : { Authorization : 'Bearer auth' } }, { status : 404 } ]
                        ]);
                    done();
                });
            });

        });
    });
});

