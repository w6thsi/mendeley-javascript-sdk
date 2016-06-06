'use strict';

/**
* Mock window object
*
* Used for testing oAuth redirection and cookie readin without breaking test
*/
module.exports = function(protocol, host, pathname, hash) {
    return {
        location: {
            protocol: protocol || 'https:',
            host: host || 'example.com',
            pathname: pathname || '/foo',
            hash: hash || '',
            toString: function() {
                return protocol + '//' + host + pathname + (hash ? '#' + hash : '');
            }
        },
        document: {
            cookie: ''
        }
    };
};
