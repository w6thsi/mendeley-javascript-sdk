'use strict';

var utils = require('./utilities');

if (typeof process === 'object' && process + '' === '[object process]') {
    global.window = {};
}

/**
 * API
 *
 * @namespace
 * @name api
 */
module.exports = {
    setAuthFlow: utils.setAuthFlow,
    setBaseUrl:  utils.setBaseUrl,

    annotations: require('./api/annotations')(),
    catalog: require('./api/catalog')(),
    documents: require('./api/documents')(),
    files: require('./api/files')(),
    folders: require('./api/folders')(),
    followers: require('./api/followers')(),
    groups: require('./api/groups')(),
    institutions: require('./api/institutions')(),
    institutionTrees: require('./api/institution-trees')(),
    locations: require('./api/locations')(),
    metadata: require('./api/metadata')(),
    profiles: require('./api/profiles')(),
    trash: require('./api/trash')()
};
