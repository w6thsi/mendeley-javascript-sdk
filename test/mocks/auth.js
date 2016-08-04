'use strict';

var Bluebird = require('bluebird');

var unauthorisedError = new Error();
unauthorisedError.response = { status: 401 };

var timeoutError = new Error();
timeoutError.response = { status: 504 };

var notFoundError = new Error();
notFoundError.response = { status: 404 };

module.exports = {
    mockImplicitGrantFlow: mockImplicitGrantFlow,
    mockAuthCodeFlow: mockAuthCodeFlow,
    unauthorisedError: unauthorisedError,
    timeoutError: timeoutError,
    notFoundError: notFoundError
};

function mockImplicitGrantFlow() {
    var fakeToken = 'auth';

    return {
        getToken: function() { return fakeToken; },
        authenticate: function() { return false; },
        refreshToken: function () { return false; }
    };
}

function mockAuthCodeFlow() {
    var fakeToken = 'auth';

    return {
        getToken: function() { return fakeToken; },
        authenticate: function() { return false; },
        refreshToken: function() {
            fakeToken = 'auth-refreshed';
            return Bluebird.resolve();
        }
    };
}
