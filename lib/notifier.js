define(function() {

    'use strict';

    var notifications = {
        commWarning: {
            code: 1001,
            level: 'warn',
            message: 'Communication error (status code $0). Retrying ($1/$2).'
        },
        authWarning: {
            code: 1002,
            level: 'warn',
            message: 'Authentication error (status code $0). Refreshing access token ($1/$2).'
        },

        reqError: {
            code: 2001,
            level: 'error',
            message: 'Request error (status code $0).'
        },
        commError: {
            code: 2002,
            level: 'error',
            message: 'Communication error (status code $0).  Maximun number of retries reached ($1).'
        },
        authError: {
            code: 2003,
            level: 'error',
            message: 'Authentication error (status code $0).  Maximun number of retries reached ($1).'
        },
        refreshNotConfigured: {
            code: 2004,
            level: 'error',
            message: 'Refresh token error. Refresh flow not configured.'
        },
        refreshError: {
            code: 2005,
            level: 'error',
            message: 'Refresh token error. Request failed (status code $0).'
        },
        tokenError: {
            code: 2006,
            level: 'error',
            message: 'Missing access token.'
        },
        parseError: {
            code: 2007,
            level: 'error',
            message: 'JSON Parsing error.'
        },
        uploadError: {
            code: 2008,
            level: 'error',
            message: 'Upload $0 ($1 %)'
        }
    };

    function createMessage(notificationId, notificationData, request, response) {
        var notification = $.extend({}, notifications[notificationId] || {});

        if (notificationData) {
            notification.message =  notification.message.replace(/\$(\d+)/g, function(m, key) {
                return '' + (notificationData[+key] !== undefined ? notificationData[+key] : '');
            });
        }
        if (request) {
            notification.request = request;
        }
        if (response) {
            notification.response = response;
        }
        return notification;
    }

    function createNotifier(logger) {
        if (!logger || typeof logger !== 'function') {
            return false;
        }

        return {
            notify: function notify(notificationId, notificationData, request, response) {
                var notification = createMessage(notificationId, notificationData, request, response);
                logger(notification);
            }
        };
    }

    return {
        createNotifier: createNotifier
        };
});
