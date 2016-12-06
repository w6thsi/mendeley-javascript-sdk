'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Search API
 *
 * @namespace
 * @name api.search
 */
module.exports = function catalog(options) {
    return {

        /**
         * Search the catalog
         *
         * @method
         * @memberof api.search
         * @param {object} params - A search catalog
         * @returns {promise}
         */
        catalog: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/search/catalog',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        })
    };
};
