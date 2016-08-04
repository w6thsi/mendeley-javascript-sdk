'use strict';

var axios = require('axios');
var Bluebird = require('bluebird');

Bluebird.onPossiblyUnhandledRejection(function() {});

// Get a function to return promises in order
function getMockPromises() {
    var responses = Array.prototype.slice.call(arguments);
    var calls = 0;
    return function() {
        return responses[calls++];
    };
}

describe('request', function() {
    var request = require('../../../lib/request');
    var mockAuth = require('../../mocks/auth');

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
                Bluebird.resolve({ status: 200, headers: {} })
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
                Bluebird.reject({ response: { status: 401 } }), // Auth failure
                Bluebird.resolve({ status: 200, headers: {} }) // Original request success
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();

            myRequest.send().then(function() {
                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(ajaxSpy.calls.count()).toEqual(2);
                expect(ajaxSpy.calls.mostRecent().args[0].headers.Authorization).toEqual('Bearer auth-refreshed');
                done();
            });

        });

        it('should fail and call authenticate if cannot refresh token', function(done) {
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuthInterface });
            var fun = getMockPromises(
                Bluebird.reject({ response: { status: 401 } }), // Auth failure
                Bluebird.resolve({ status: 200, headers: {} }) // Original request success
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue(Bluebird.reject({ status: 500 }));
            var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(1);
                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(authAuthenticateSpy.calls.count()).toEqual(1);
                done();
            });
        });

        it('should NOT do more than maxAuthRetries', function(done) {
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var myRequest = request.create({ method: 'get' }, { maxAuthRetries: 2, authFlow: mockAuthInterface });

            var ajaxSpy = spyOn(axios, 'request').and.returnValue(Bluebird.reject(mockAuth.unauthorisedError));
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
            var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(3);
                expect(authRefreshSpy.calls.count()).toEqual(2);
                expect(authAuthenticateSpy.calls.count()).toEqual(1);
            }).finally(done);
        });
    });

    describe('timeout failures', function() {
        it('should NOT retry by default', function(done) {
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Bluebird.reject(mockAuth.unauthorisedError),
                Bluebird.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().finally(function() {
                expect(ajaxSpy.calls.count()).toEqual(1);
            }).finally(done);

        });

        it('should allow setting maximum number of retries', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().finally(function() {
                expect(ajaxSpy.calls.count()).toEqual(2);
            }).finally(done);
        });


        it('should NOT do more than maxRetries', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(2);
                done();
            });
        });

        it('should correctly resolve the original deferred', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 10, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.reject(mockAuth.timeoutError),
                Bluebird.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().finally(function() {
                expect(ajaxSpy.calls.count()).toEqual(10);
                done();
            }).catch(function() {});
        });
    });

    describe('generic failures', function() {
        it('should NOT retry on generic errors', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Bluebird.reject(mockAuth.notFoundError),
                Bluebird.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(1);
            }).finally(done);
        });
    });
});
