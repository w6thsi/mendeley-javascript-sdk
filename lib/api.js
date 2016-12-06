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

var endpointFactories = {
    annotations: require('./api/annotations'),
    catalog: require('./api/catalog'),
    search: require('./api/search'),
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
      endpoints[endpointName] = endpointFactories[endpointName](options);
  });

  return endpoints;
}

module.exports = function (options) {
  var api = {};

  assign(api, createEndpoints(options));

  return api;
};
