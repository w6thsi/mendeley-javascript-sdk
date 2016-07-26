'use strict';

var utils = require('../utilities');

/**
 * Profiles API
 *
 * @namespace
 * @name api.profiles
 */
module.exports = function profiles(options) {
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
        me: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles/me'
        }),

        /**
         * Retrieve a profile by id
         *
         * @method
         * @memberof api.profiles
         * @param {string} id - User id
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles/{id}',
            args: ['id']
        }),

        /**
         * Update profiles
         *
         * @method
         * @memberof api.profiles
         * @param {object} data - The new profiles data
         * @returns {promise}
         */
        update: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/profiles/me',
            headers: dataHeaders,
            followLocation: true
        }),

        /**
         * Retrieve a profile by email address
         *
         * @method
         * @memberof api.profiles
         * @param {string} email - Email address
         * @returns {promise}
         */
         retrieveByEmail: utils.requestFun({
             authFlow: options.authFlow,
             baseUrl: options.baseUrl,
             method: 'GET',
             resource: '/profiles?email={email}',
             args: ['email']
         })

    };
};
