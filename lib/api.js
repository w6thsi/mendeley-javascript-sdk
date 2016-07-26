'use strict';

var assign = require('object-assign');
var Bluebird = require('bluebird');

Bluebird.config({
    warnings: false,
    wForgottenReturn: false
});

if (typeof process === 'object' && process + '' === '[object process]') {
    global.window = {};
}

function decorateWithFor(originalInstance, factory, options) {
    var instanceMap = {};

    originalInstance.for = function (mappingKey) {
        if (!mappingKey) {
            return originalInstance;
        }

        if (!instanceMap[mappingKey]) {
            // create a new instance
            instanceMap[mappingKey] = factory(options);
        }

        return instanceMap[mappingKey];
    };

    return originalInstance;
}

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

function createEndpoints (options) {
  var endpoints = {};

  Object.keys(endpointFactories).forEach(function(endpointName) {
      var factory = endpointFactories[endpointName];
      var originalInstance = factory(options);

      endpoints[endpointName] = decorateWithFor(originalInstance, factory, options);
  });

  return endpoints;
}

module.exports = function (options) {
  var api = {};

  assign(api, createEndpoints(options));

  return api;
};
