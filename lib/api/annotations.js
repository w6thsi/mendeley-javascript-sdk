'use strict';

var utils = require('../utilities');

/**
 * Annotations API
 *
 * @namespace
 * @name api.annotations
 */
module.exports = function annotations(options) {

    var dataHeaders = {
        annotation: { 'Content-Type': 'application/vnd.mendeley-annotation.1+json' }
    };

    return {

        /**
         * Retrieve an annotation
         *
         * @method
         * @memberof api.annotations
         * @param {string} id - Annotation UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/annotations/{id}',
            args: ['id']
        }),

        /**
         * Patch a single annotation
         *
         * @method
         * @memberof api.annotations
         * @param {string} id - Annotation UUID
         * @param {object} text - The updated note text
         * @returns {Promise}
         */
        patch: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/annotations/{id}',
            args: ['id'],
            headers: dataHeaders.annotation,
            followLocation: true
        }),

        /**
         * Create a single annotation
         *
         * @method
         * @memberof api.annotations
         * @param {object} text - Note text
         * @returns {Promise}
         */
        create: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/annotations',
            headers: dataHeaders.annotation,
            followLocation: true
        }),

         /**
         * Delete a single annotation
         *
         * @method
         * @memberof api.annotations
         * @param {string} id - Annotation UUID
         * @returns {Promise}
         */
        delete: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/annotations/{id}',
            args: ['id']
        }),

        /**
         * Get a list of annotations
         *
         * @method
         * @memberof api.annotations
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/annotations'
        }),

        /**
         * The total number of annotations - set after the first call to annotations.list()
         *
         * @var
         * @memberof api.annotations
         * @type {integer}
         */
        count: 0,

        /**
         * Get the next page of annotations
         *
         * @method
         * @memberof api.annotations
         * @returns {promise}
         */
        nextPage: utils.requestPageFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            rel: 'next'
        }),

        /**
         * Get the previous page of annotations
         *
         * @method
         * @memberof api.annotations
         * @returns {promise}
         */
        previousPage: utils.requestPageFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            rel: 'previous'
        }),

        /**
         * Get the last page of annotations
         *
         * @method
         * @memberof api.annotations
         * @returns {promise}
         */
        lastPage: utils.requestPageFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            rel: 'last'
        }),

        /**
         * Get pagination links
         *
         * @method
         * @memberof api.annotations
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
         * @memberof api.annotations
         */
        resetPagination: utils.resetPaginationLinks

    };
};
