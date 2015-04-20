define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Groups API
     *
     * @namespace
     * @name api.groups
     */
    return function groups() {
        return {

            /**
             * Retrieve a group
             *
             * @method
             * @memberof api.groups
             * @param {string} id - A group UUID
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/groups/{id}', ['id']),

            /**
             * Get a list of groups
             *
             * @method
             * @memberof api.groups
             * @returns {promise}
             */
            list: utils.requestFun('GET', '/groups/'),

            /**
             * The total number of groups - set after the first call to groups.list()
             *
             * @var
             * @memberof api.groups
             * @type {integer}
             */
            count: 0,

            /**
             * Get the next page of groups
             *
             * @method
             * @memberof api.groups
             * @returns {promise}
             */
            nextPage: utils.requestPageFun('next'),

            /**
             * Get the previous page of groups
             *
             * @method
             * @memberof api.groups
             * @returns {promise}
             */
            previousPage: utils.requestPageFun('previous'),

            /**
             * Get the last page of groups
             *
             * @method
             * @memberof api.groups
             * @returns {promise}
             */
            lastPage: utils.requestPageFun('last'),

            /**
             * Get pagination links
             *
             * @method
             * @memberof api.groups
             * @returns {object}
             */
            paginationLinks: {
                last: false,
                next: false,
                previous: false
            },

            /**
             * Reset all pagination links
             *
             * @method
             * @memberof api.groups
             */
            resetPagination: utils.resetPaginationLinks

        };
    };

});
