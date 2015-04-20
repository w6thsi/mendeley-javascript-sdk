define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Files API
     *
     * @namespace
     * @name api.files
     */
    return function files() {
        return {

            /**
             * Create a new file
             *
             * @method
             * @memberof api.files
             * @param {object} file - A file object
             * @param {string} documentId - A document UUID
             * @returns {promise}
             */
            create: utils.requestWithFileFun('POST', '/files', 'document'),

            /**
             * Get a list of files for a document
             *
             * @method
             * @memberof api.files
             * @param {string} id - A document UUID
             * @returns {promise}
             */
            list: utils.requestFun('GET', '/files?document_id={id}', ['id']),

            /**
             * Delete a file
             *
             * @method
             * @memberof api.files
             * @param {string} id - A file UUID
             * @returns {promise}
             */
            remove: utils.requestFun('DELETE', '/files/{id}', ['id'])

        };
    };

});
