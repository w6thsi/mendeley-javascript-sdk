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
			annotation: { 'Content-Type': 'application/vnd.mendeley-annotation.1+json' }
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
             * Patch a single annotation
             *
             * @method
             * @memberof api.annotations
             * @param {String} id - Annotation UUID
             * @param {object} text - The updated note text
             * @returns {Promise}
             */
            patch: utils.requestWithDataFun('PATCH', '/annotations/{id}', ['id'], dataHeaders.annotation, true),

            /**
             * Create a single annotation
             *
             * @method
             * @memberof api.annotations
             * @param {object} text - Note text
             * @returns {Promise}
             */
            create: utils.requestWithDataFun('POST', '/annotations/', [], dataHeaders.annotation, true),

             /**
             * Delete a single annotation
             *
             * @method
             * @memberof api.annotations
             * @param {String} id - Annotation UUID
             * @returns {Promise}
             */
            delete: utils.requestFun('DELETE', '/annotations/{id}', ['id']),

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
