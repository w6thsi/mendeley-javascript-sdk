'use strict';

describe('utilities', function() {

    var utils = require('utilities');
    var mockAuth = require('mocks/auth');
    var axios = require('axios');

    utils.setAuthFlow(mockAuth.mockImplicitGrantFlow());

    describe('requestWithFileFun', function() {

        var ajaxSpy;

        beforeEach(function() {
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({
                headers: {}
            }));
        });

        it('should allow a custom content-type to be set against a request', function() {
            var file = {
                name: 'fileName',
                type: 'text/plain'
            };
            var requestFunction = utils.requestWithFileFun('POST', 'url', 'link', {
                'Content-Type': 'text/html'
            });

            requestFunction(file);
            expect(ajaxSpy.calls.mostRecent().args[0].headers['Content-Type']).toBe('text/html');
        });

    });

});
