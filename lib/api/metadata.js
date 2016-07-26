'use strict';

var utils = require('../utilities');

/**
 * Metadata API
 *
 * @namespace
 * @name api.metadata
 */
module.exports = function metadata(options) {
    var dataHeaders = {
            'Accept': 'application/vnd.mendeley-document-lookup.1+json'
        };

    return {

        /**
         * Retrieve a document metadata
         *
         * @method
         * @memberof api.metadata
         * @param {object} params - A metadata search filter
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/metadata',
            headers: dataHeaders
        })

    };
};
