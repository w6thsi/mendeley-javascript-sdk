define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Locations API
     *
     * @namespace
     * @name api.locations
     */
    return function locations() {
        return {

            /**
             * Search for the locations
             *
             * @method
             * @memberof api.locations
             * @param {object} params - A locations search filter
             * @returns {promise}
             */
            search: utils.requestFun('GET', '/locations'),

            /**
             * Retrieve a location object
             *
             * @method
             * @memberof api.locations
             * @param {string} id - A location ID
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/locations/{id}', ['id'])

        };
    };

});
