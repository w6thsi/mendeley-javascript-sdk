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
             * Return an institution's entire tree
             *
             * @method
             * @memberof api.institution_trees
             * @param {object} params - An institution ID
             * @returns {promise}
             */
            list: utils.requestFun('GET', '/institution_trees'),

            /**
             * Return the child nodes of an institution
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
