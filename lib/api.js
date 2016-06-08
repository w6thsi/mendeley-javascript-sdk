'use strict';

var utils = require('./utilities');
var assign = require('object-assign');

if (typeof process === 'object' && process + '' === '[object process]') {
    global.window = {};
}

/**
 * API
 *
 * @namespace
 * @name api
 */
var methods = {
    setAuthFlow: utils.setAuthFlow,
    setBaseUrl: utils.setBaseUrl,
    setNotifier: utils.setNotifier,
    setnewInstancetifier: utils.setnewInstancetifier
};

var endpointFactories = {
    annotations: require('./api/annotations'),
    catalog: require('./api/catalog'),
    documents: require('./api/documents'),
    files: require('./api/files'),
    folders: require('./api/folders'),
    followers: require('./api/followers'),
    groups: require('./api/groups'),
    institutions: require('./api/institutions'),
    institutionTrees: require('./api/institution-trees'),
    locations: require('./api/locations'),
    metadata: require('./api/metadata'),
    profiles: require('./api/profiles'),
    trash: require('./api/trash')
};

var endpoints = {};

Object.keys(endpointFactories).forEach(function (endpointName) {
    var instanceMap = {};
    var firstInstance = endpointFactories[endpointName]();

    endpoints[endpointName] = firstInstance;

    firstInstance.for = function (mappingKey) {
        if (!mappingKey) {
            return firstInstance;
        }

        if (!instanceMap[mappingKey]) {
            // create a new instance
            instanceMap[mappingKey] = endpointFactories[endpointName]();
        }

        return instanceMap[mappingKey];
    };
});

module.exports = assign(endpoints, methods);
