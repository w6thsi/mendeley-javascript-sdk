define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Metadata API
     *
     * @namespace
     * @name api.metadata
     */
    return function metadata() {
        var dataHeaders = {
                'Accept': 'application/vnd.mendeley-document-lookup.1+json'
            };

        return {

            /**
             * Retrieve a document metadata
             *
             * @method
             * @memberof api.metadata
             * @param {object} params - A metadata search filter
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/metadata', false, dataHeaders, false)

        };
    };

});
