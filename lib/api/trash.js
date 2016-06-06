'use strict';

var utils = require('../utilities');

/**
 * Trash API
 *
 * @namespace
 * @name api.trash
 */
module.exports = function trash() {
    return {

        /**
         * Retrieve a document from the trash
         *
         * @method
         * @memberof api.trash
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun('GET', '/trash/{id}', ['id']),

        /**
         * List all documents in the trash
         *
         * @method
         * @memberof api.trash
         * @returns {promise}
         */
        list: utils.requestFun('GET', '/trash/'),

        /**
         * Restore a trashed document
         *
         * @method
         * @memberof api.trash
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        restore: utils.requestFun('POST', '/trash/{id}/restore', ['id']),

        /**
         * Permanently delete a trashed document
         *
         * @method
         * @memberof api.trash
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        destroy: utils.requestFun('DELETE', '/trash/{id}', ['id']),

        /**
         * The total number of trashed documents - set after the first call to trash.list()
         *
         * @var
         * @memberof api.trash
         * @type {integer}
         */
        count: 0,

        /**
         * Get the next page of trash
         *
         * @method
         * @memberof api.trash
         * @returns {promise}
         */
        nextPage: utils.requestPageFun('next'),

        /**
         * Get the previous page of trash
         *
         * @method
         * @memberof api.trash
         * @returns {promise}
         */
        previousPage: utils.requestPageFun('previous'),

        /**
         * Get the last page of trash
         *
         * @method
         * @memberof api.trash
         * @returns {promise}
         */
        lastPage: utils.requestPageFun('last'),


        /**
         * Get pagination links
         *
         * @method
         * @memberof api.trash
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
         * @memberof api.trash
         */
        resetPagination: utils.resetPaginationLinks

    };
};
