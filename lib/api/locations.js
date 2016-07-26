'use strict';

var utils = require('../utilities');

/**
 * Locations API
 *
 * @namespace
 * @name api.locations
 */
module.exports = function locations(options) {
    return {

        /**
         * Search for the locations
         *
         * @method
         * @memberof api.locations
         * @param {object} params - A locations search filter
         * @returns {promise}
         */
        search: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/locations'
        }),

        /**
         * Retrieve a location object
         *
         * @method
         * @memberof api.locations
         * @param {string} id - A location ID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/locations/{id}',
            args: ['id']
        })

    };
};
