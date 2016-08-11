'use strict';

var api = require('./api');
var auth = require('./auth');
var request = require('./request');
var mimeTypes = require('./mime-types');

// Exports Mendeley SDK
module.exports = function (options) {
    if (!options) {
      throw new Error('Please pass an options object with an authFlow property');
    }

    options.baseUrl = options.baseUrl || 'https://api.mendeley.com';
    options.authFlow = options.authFlow || {};

    if (typeof options.authFlow !== 'function') {
        var authFlow = options.authFlow;

        options.authFlow = function () {
          return authFlow;
        };
    }

    if (typeof options.baseUrl !== 'function') {
        var baseUrl = options.baseUrl;

        options.baseUrl = function () {
          return baseUrl;
        };
    }

    return api(options);
};

module.exports.Auth = auth;
module.exports.Request = request;
module.exports.MimeTypes = mimeTypes;
