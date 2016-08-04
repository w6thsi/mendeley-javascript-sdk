'use strict';

module.exports = function authenticatedFlow(token) {
    return {
        getToken: function() {
            return token;
        }
    };
};
