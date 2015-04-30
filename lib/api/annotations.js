define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Annotations API
     *
     * @namespace
     * @name api.annotations
     */
    return function annotations() {
    
    	var dataHeaders = {
                annotation: { 'Content-Type': 'application/vnd.mendeley-annotation.1+json' },
                'document': { 'Content-Type': 'application/vnd.mendeley-document.1+json' }
            };

        return {

            /**
             * Retrieve an annotation
             *
             * @method
             * @memberof api.annotations
             * @param {string} id - A annotation UUID
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/annotations/{id}', ['id']),

            /**
             * Get annotations from a document
             *
             * @method
             * @memberof api.annotations
             * @param {String} id - A document UUID
             * @returns {Promise}
             */
            retrieveByDocumentId: utils.requestFun('GET', '/annotations?document_id={id}', ['id']),

            /**
             * Get a type of annotation from a document id
             *
             * @method
             * @memberof api.annotations
             * @param {String} type - An annotation type
             * @param {String} id - A document UUID
             * @returns {Promise}
             */
            retrieveByDocIdAndType: utils.requestFun('GET', '/annotations?type={type}&document_id={id}', ['type', 'id']),

			/**
             * Patch a single annotation
             *
             * @method
             * @memberof api.annotations
             * @param {String} id - Annotation UUID
             * @param {object} text - The updated note text
             * @returns {Promise}
             */
            patchByAnnotationId: utils.requestWithDataFun('PATCH', '/annotations/{id}', ['id'], dataHeaders.annotation, true),

            /**
             * Get a list of annotations
             *
             * @method
             * @memberof api.annotations
             * @returns {promise}
             */
            list: utils.requestFun('GET', '/annotations/'),

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
            nextPage: utils.requestPageFun('next'),

            /**
             * Get the previous page of annotations
             *
             * @method
             * @memberof api.annotations
             * @returns {promise}
             */
            previousPage: utils.requestPageFun('previous'),

            /**
             * Get the last page of annotations
             *
             * @method
             * @memberof api.annotations
             * @returns {promise}
             */
            lastPage: utils.requestPageFun('last'),

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

});
