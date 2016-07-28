'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Documents API
 *
 * @namespace
 * @name api.documents
 */
module.exports = function documents(options) {

    var listDocuments = utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/documents',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),
        listFolder = utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/folders/{id}/documents',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        });

    return {

        /**
         * Create a new document
         *
         * @method
         * @memberof api.documents
         * @param {object} data - The document data
         * @returns {promise}
         */
        create: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/documents',
            headers: {
              'Content-Type': MIME_TYPES.DOCUMENT,
              'Accept': MIME_TYPES.DOCUMENT
            },
            followLocation: true
        }),

        /**
         * Create a new document from a file
         *
         * @method
         * @memberof api.documents
         * @param {object} file - A file object
         * @returns {promise}
         */
        createFromFile: utils.requestWithFileFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/documents',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * Create a new group document from a file
         *
         * @method
         * @memberof api.documents
         * @param {object} file - A file object
         * @param {string} groupId - A group UUID
         * @returns {promise}
         */
        createFromFileInGroup: utils.requestWithFileFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/documents',
            linkType: 'group',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * Retrieve a document
         *
         * @method
         * @memberof api.documents
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/documents/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * Update document
         *
         * @method
         * @memberof api.documents
         * @param {string} id - A document UUID
         * @param {object} data - The new document data
         * @returns {promise}
         */
        update: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/documents/{id}',
            args: ['id'],
            headers: {
              'Content-Type': MIME_TYPES.DOCUMENT,
              'Accept': MIME_TYPES.DOCUMENT
            },
            followLocation: true
        }),

        /**
         * Clone a document from user library to a group ( or vice versa )
         *
         * @method
         * @memberof api.documents
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        clone: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/documents/{id}/actions/cloneTo',
            args: ['id'],
            headers: {
              'Content-Type': MIME_TYPES.DOCUMENT_CLONE,
              'Accept': MIME_TYPES.DOCUMENT_CLONE
            },
            followLocation: true
        }),

        /**
         * List documents
         *
         * @method
         * @memberof api.documents
         * @param {object} params - Query paramaters
         * @returns {promise}
         */
        list: function(params) {
            if (!params || typeof params.folderId === 'undefined') {
                return listDocuments.call(this, params);
            } else {
                var folderId = params.folderId,
                    callParams = {
                        limit: params.limit
                    };
                delete params.folderId;
                return listFolder.call(this, folderId, callParams);
            }
        },

        /**
         * Search documents
         *
         * @method
         * @memberof api.documents
         * @param {object} params - Search paramaters
         * @returns {promise}
         */
        search: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/search/documents',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * Move a document to the trash
         *
         * @method
         * @memberof api.documents
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        trash: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/documents/{id}/trash',
            args: ['id']
        }),

        /**
         * The total number of documents - set after the first call to documents.list()
         *
         * @var
         * @memberof api.documents
         * @type {integer}
         */
        count: 0,

        /**
         * Get the next page of documents
         *
         * @method
         * @memberof api.documents
         * @returns {promise}
         */
        nextPage: utils.requestPageFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            rel: 'next'
        }),

        /**
         * Get the previous page of documents
         *
         * @method
         * @memberof api.documents
         * @returns {promise}
         */
        previousPage: utils.requestPageFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            rel: 'previous'
        }),

        /**
         * Get the last page of documents
         *
         * @method
         * @memberof api.documents
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
         * @memberof api.documents
         * @returns {object}
         */
        paginationLinks: {
            last: false,
            next: false,
            previous: false
        },

        /**
         * Reset all pagination
         *
         * @method
         * @memberof api.documents
         */
        resetPagination: utils.resetPaginationLinks

    };
};
