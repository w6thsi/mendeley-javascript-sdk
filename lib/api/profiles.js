define(['../utilities'], function(utils) {

    'use strict';

    /**
     * Profiles API
     *
     * @namespace
     * @name api.profiles
     */
    return function profiles() {
        var dataHeaders = {
            'Content-Type': 'application/vnd.mendeley-profile-amendment.1+json'
        };

        return {

            /**
             * Retrieve the profile of the currently logged user
             *
             * @method
             * @memberof api.profiles
             * @returns {promise}
             */
            me: utils.requestFun('GET', '/profiles/me'),

            /**
             * Retrieve a profile by id
             *
             * @method
             * @memberof api.profiles
             * @returns {promise}
             */
            retrieve: utils.requestFun('GET', '/profiles/{id}', ['id']),

            /**
             * Update profiles
             *
             * @method
             * @memberof api.profiles
             * @param {object} data - The new profiles data
             * @returns {promise}
             */
            update: utils.requestWithDataFun('PATCH', '/profiles/me', [], dataHeaders, true)

        };
    };

});
