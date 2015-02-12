define(function() {

    'use strict';

    var callback = function() {};

    var notifications = {
        commWarning : {
            code: 1001,
            level: 'warning',
            message: 'Communication error (status code $0). Retrying ($1/$2).'
        },
        authWarning : {
            code: 1002,
            level: 'warning',
            message: 'Authentication error (status code $0). Refreshing access token ($1/$2).'
        },

        reqError : {
            code: 2001,
            level: 'error',
            message: 'Request error (status code $0).'
        },
        commError : {
            code: 2002,
            level: 'error',
            message: 'Communication error (status code $0).  Maximun number of retries reached ($1).'
        },
        authError : {
            code: 2003,
            level: 'error',
            message: 'Authentication error (status code $0).  Maximun number of retries reached ($1).'
        },
        refreshNotConfigured : {
            code: 2004,
            level: 'error',
            message: 'Impossible refresh access token. Refresh flow not configured.'
        },
        refreshError : {
            code: 2005,
            level: 'error',
            message: 'Impossible refresh access token. Reqeust failed (status code $0).'
        }
    };

    function notify(notificationId, notificationData, request, response) {

        var notification = $.extend({}, notifications[notificationId] || {});

        if(notificationData) {
            notification.message =  notification.message.replace(/\$(\d+)/g,function(m,key){return notificationData[+key] || '';});
        }
        if(request) {
            notification.request = request;
        }
        if(response) {
            notification.response = response;
        }

        callback(notification);
    }

    function setLogger(logger) {
        callback = logger;
    }

    return {
        setLogger: setLogger ,
        notify : notify
        };

});
