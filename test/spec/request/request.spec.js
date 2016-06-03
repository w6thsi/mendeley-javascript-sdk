define(function(require) {

    'use strict';

    var Promise = require('bluebird');
    Promise.config({warnings: false});
    var axios = require('axios');
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

        it('should have a request type property', function() {
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            expect(myRequest.request.method).toBe('get');
        });

        it('should have allow setting the type to whatever you like', function() {
            var myRequest = request.create({ method: 'POST' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            expect(myRequest.request.method).toBe('POST');
        });

        describe('authentication', function() {

            it('should add optional accessToken to the Authorization header', function(done) {
                var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    Promise.resolve({ status: 200, headers: {} })
                );
                spyOn(axios, 'request').and.callFake(fun);

                myRequest.send().finally(function() {
                    expect(myRequest.request.headers.Authorization).toEqual('Bearer auth');
                }).finally(done);

            });
        });

        describe('authentication failures', function() {

            it('should try calling authFlow.refreshToken() if using authCodeFlow', function(done) {
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ method: 'get' }, { authFlow: mockAuthInterface });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.unauthorisedError), // Auth failure
                    Promise.resolve({ status: 200, headers: {} }) // Original request success
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();

                myRequest.send().finally(function() {
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(ajaxSpy.calls.count()).toEqual(2);
                    expect(ajaxSpy.calls.mostRecent().args[0].headers.Authorization).toEqual('Bearer auth-refreshed');
                }).finally(done);

            });

            it('should fail and call authenticate if cannot refresh token', function(done) {
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ method: 'get' }, { authFlow: mockAuthInterface });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.unauthorisedError), // Auth failure
                    Promise.resolve({ status: 200, headers: {} }) // Original request success
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue(Promise.reject({ status: 500 }));
                var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(authAuthenticateSpy.calls.count()).toEqual(1);
                }).finally(done);

            });

            it('should send a notification if cannot refresh token', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ method: 'get' }, { maxAuthRetries: 2, authFlow: mockAuthInterface }, {notify: mockNotifier});

                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.unauthorisedError));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue(Promise.reject({ status: 500 }));

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(mockNotifier.calls.count()).toEqual(3);
                    // expect(mockNotifier.calls.allArgs()).toEqual([
                    //     ['startInfo', [ 'get', undefined ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } } ],
                    //     ['authWarning', [ 401, 1, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } } ],
                    //     ['refreshError', [500], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } }, undefined ]
                    // ]);
                }).finally(done);
            });

            it('should send a notification if no refresh token defined', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ method: 'get' }, { maxAuthRetries: 2, authFlow: mockAuthInterface }, {notify: mockNotifier});

                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.unauthorisedError));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue(false);

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                    expect(authRefreshSpy.calls.count()).toEqual(1);
                    expect(mockNotifier.calls.count()).toEqual(3);
                    // expect(mockNotifier.calls.allArgs()).toEqual([
                    //     ['startInfo', [ 'get', undefined ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } } ],
                    //     ['authWarning', [ 401, 1, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } } ],
                    //     ['refreshNotConfigured', [] ]
                    // ]);
                }).finally(done);
            });


            it('should NOT do more than maxAuthRetries', function(done) {
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ method: 'get' }, { maxAuthRetries: 2, authFlow: mockAuthInterface });

                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.unauthorisedError));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
                var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(3);
                    expect(authRefreshSpy.calls.count()).toEqual(2);
                    expect(authAuthenticateSpy.calls.count()).toEqual(1);
                }).finally(done);
            });

            it('should send a notification on authorization failure', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var mockAuthInterface = mockAuth.mockAuthCodeFlow();
                var myRequest = request.create({ method: 'get' }, { maxAuthRetries: 2, authFlow: mockAuthInterface }, {notify: mockNotifier});

                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.unauthorisedError));
                var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
                var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(3);
                    expect(authRefreshSpy.calls.count()).toEqual(2);
                    expect(authAuthenticateSpy.calls.count()).toEqual(1);

                    expect(mockNotifier.calls.count()).toEqual(4);
                    // expect(mockNotifier.calls.allArgs()).toEqual([
                    //     ['startInfo', [ 'get', undefined ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth-refreshed' } } ],
                    //     ['authWarning', [ 401, 1, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth-refreshed' } } ],
                    //     ['authWarning', [ 401, 2, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth-refreshed' } } ],
                    //     ['authError', [ 401, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth-refreshed' } }, { status : 401 } ]
                    // ]);
                }).finally(done);
            });
        });

        describe('timeout failures', function() {

            it('should NOT retry by default', function(done) {
                var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.unauthorisedError),
                    Promise.resolve({ status: 200, headers: {} })
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

                myRequest.send().finally(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                }).finally(done);

            });

            it('should allow setting maximum number of retries', function(done) {
                var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.timeoutError),
                    Promise.resolve({ status: 200, headers: {} })
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

                myRequest.send().finally(function() {
                    expect(ajaxSpy.calls.count()).toEqual(2);
                }).finally(done);
            });


            it('should NOT do more than maxRetries', function(done) {
                var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.resolve({ status: 200, headers: {} })
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

                myRequest.send().finally(function() {
                    expect(ajaxSpy.calls.count()).toEqual(2);
                }).finally(done);
            });

            it('should correctly resolve the original deferred', function(done) {
                var myRequest = request.create({ method: 'get' }, { maxRetries: 10, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.reject(mockAuth.timeoutError),
                    Promise.resolve({ status: 200, headers: {} })
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

                myRequest.send().finally(function() {
                    expect(ajaxSpy.calls.count()).toEqual(10);
                }).finally(done);
            });

            it('should send a notification on request failure', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var myRequest = request.create({ method: 'get' }, { maxRetries: 2, authFlow: mockAuth.mockImplicitGrantFlow() }, {notify: mockNotifier});

                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.timeoutError));

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(3);

                    expect(mockNotifier.calls.count()).toEqual(4);
                    // expect(mockNotifier.calls.allArgs()).toEqual([
                    //     ['startInfo', [ 'get', undefined ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } } ],
                    //     ['commWarning', [ 504, 1, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } }, { status : 504 } ],
                    //     ['commWarning', [ 504, 2, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } }, { status : 504 } ],
                    //     ['commError', [ 504, 2 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } }, { status : 504 } ]
                    // ]);
                }).finally(done);
            });
        });

        describe('generic failures', function() {

            it('should NOT retry on generic errors', function(done) {
                var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
                var fun = getMockPromises(
                    Promise.reject(mockAuth.notFoundError),
                    Promise.resolve({ status: 200, headers: {} })
                );
                var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);
                }).finally(done);
            });

            it('should send a notification on request failure', function(done) {
                var mockNotifier = jasmine.createSpy('notifier');
                var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() }, {notify: mockNotifier});

                var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.notFoundError));

                myRequest.send().catch(function() {
                    expect(ajaxSpy.calls.count()).toEqual(1);

                    expect(mockNotifier.calls.count()).toEqual(2);
                    // expect(mockNotifier.calls.allArgs()).toEqual([
                    //     ['startInfo', [ 'get', undefined ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } } ],
                    //     ['reqError', [ 404 ], { method : 'get', headers : { Accept: '', Authorization : 'Bearer auth' } }, { status : 404 } ]
                    // ]);
                }).finally(done);
            });

        });
    });
});

