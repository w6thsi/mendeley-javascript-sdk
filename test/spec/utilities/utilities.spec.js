define(function(require) {

    'use strict';

    describe('utilities', function() {

        var utils = require('utilities');
        var mockAuth = require('mocks/auth');
        utils.setAuthFlow(mockAuth.mockImplicitGrantFlow());

        describe('requestWithFileFun', function() {

            var ajaxSpy;

            beforeEach(function() {
                ajaxSpy = spyOn($, 'ajax').and.returnValue($.Deferred().resolve());
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
});

