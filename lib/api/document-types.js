'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Search API
 *
 * @namespace
 * @name api.search
 */
module.exports = function documentTypes(options) {
    return {

        /**
         * Retrieve the document types
         *
         * @method
         * @memberof api.documentTypes
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/document_types',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT_TYPE
            }
        })
    };
};
