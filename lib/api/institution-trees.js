define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Institution trees API
     *
     * @namespace
     * @name api.institutionTrees
     */
    return function institutionTrees() {
        return {

            /**
             * Return all institution trees that the given institution is a member of
             *
             * @method
             * @memberof api.institution_trees
             * @param {object} params - An institution ID
             * @returns {promise}
             */
            list: utils.requestFun('GET', '/institution_trees'),

            /**
             * Return only the child nodes of a given institution
             *
             * @method
             * @memberof api.institution_trees
             * @param {string} id - An institution ID
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/institution_trees/{id}', ['id'])

        };
    };

});
