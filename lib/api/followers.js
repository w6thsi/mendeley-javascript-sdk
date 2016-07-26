'use strict';

var utils = require('../utilities');

/**
 * Followers API
 *
 * @namespace
 * @name api.followers
 */
module.exports = function followers(options) {
    var dataHeaders = {
        create: {
            'Content-Type': 'application/vnd.mendeley-follow-request.1+json'
        },
        accept: {
            'Content-Type': 'application/vnd.mendeley-follow-acceptance.1+json'
        }
    };

    return {

        /**
         * Get a list of followers.
         *
         * @method
         * @memberof api.followers
         * @param {object} params - {
         *  follower: <profile_id>,
         *  followed: <profile_id>,
         *  status: <"following" or "pending">,
         *  limit: <int>
         * }
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/followers'
        }),

        /**
         * Create a follower relationship.
         *
         * The follower id is inferred from whoever is logged in. The response
         * is a relationship that includes the status which might be "following" or
         * "pending" depending on the privacy settings of the profile being
         * followed.
         *
         * @method
         * @memberof api.followers
         * @param {object} data - { followed: <profile id> }
         * @returns {promise}
         */
        create: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/followers',
            headers: dataHeaders.create
        }),

        /**
         * Delete a follower relationship.
         *
         * This requires a relationship id which can be retrieved via the list() method.
         *
         * @param {string} id - The relationship id
         * @memberof api.followers
         * @returns {promise}
         */
        remove: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/followers/{id}',
            args: ['id']
        }),

        /**
         * Accept a follower request by updating the relationship.
         *
         * This requires a relationship id which can be retrieved via the list() method.
         *
         * @method
         * @memberof api.followers
         * @param {string} id - The relationship id
         * @param {object} data - { status: "following" } (note "following" is currently the only supported status)
         * @returns {promise}
         */
        accept: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/followers/{id}',
            args: ['id'],
            headers: dataHeaders.accept
        })

    };
};
