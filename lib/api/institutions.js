'use strict';

var utils = require('../utilities');

/**
 * Institutions API
 *
 * @namespace
 * @name api.institutions
 */
module.exports = function institutions(options) {
    return {

        /**
         * Search for the institutions
         *
         * @method
         * @memberof api.institutions
         * @param {object} params - An institutions search filter
         * @returns {promise}
         */
        search: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/institutions'
        }),

        /**
         * Retrieve an institution object
         *
         * @method
         * @memberof api.institutions
         * @param {string} id - An institution ID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/institutions/{id}',
            args: ['id']
        })

    };
};
