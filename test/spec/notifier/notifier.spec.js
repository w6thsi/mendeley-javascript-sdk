define(function(require) {

    'use strict';

    describe('notifier', function() {
    	var notifier = require('notifier');
    	var logger = jasmine.createSpy('logger');
        var apiNotifier = notifier.createNotifier(logger);


        it ('should send a notification to the logger', function() {
            apiNotifier.notify('commWarning', [504, 1, 99], {request: true}, {response: true});
            expect(logger).toHaveBeenCalledWith({
            	code: 1001,
            	level: 'warn',
            	message: 'Communication error (status code 504). Retrying (1/99).',
            	request: {request: true},
            	response: {response: true}
            });
        });
    });
});