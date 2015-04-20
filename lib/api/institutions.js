define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Institutions API
     *
     * @namespace
     * @name api.institutions
     */
    return function institutions() {
        return {

            /**
             * Search for the institutions
             *
             * @method
             * @memberof api.institutions
             * @param {object} params - A institutions search filter
             * @returns {promise}
             */
            search: utils.requestFun('GET', '/institutions'),

            /**
             * Retrieve an institution data
             *
             * @method
             * @memberof api.institutions
             * @param {string} id - A institutions UUID
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/institutions/{id}', ['id'])

        };
    };

});
