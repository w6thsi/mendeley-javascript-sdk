define(function(require) {

    'use strict';

    describe('notifier', function() {
    	var notifier = require('notifier');

        it ('should send a notification to the logger', function() {
            var logger = jasmine.createSpy('logger');
            var apiNotifier = notifier.createNotifier(logger, 'warn');
            apiNotifier.notify('commWarning', [504, 1, 99], {request: true}, {response: true});
            expect(logger).toHaveBeenCalledWith({
            	code: 2001,
            	level: 'warn',
            	message: 'Communication error (status code 504). Retrying (1/99).',
            	request: {request: true},
            	response: {response: true}
            });
        });

        it ('shouldn\'t send a notification to the logger if the message level is below the minimum', function() {
            var logger = jasmine.createSpy('logger');
            var apiNotifier = notifier.createNotifier(logger, 'warn');
            apiNotifier.notify('startInfo', null , {request: true}, {response: true});
            expect(logger).not.toHaveBeenCalled();
        });
    });
});