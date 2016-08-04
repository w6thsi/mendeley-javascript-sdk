'use strict';

var noop = require('./noop');

function wrap (auth) {
  if (!auth.authenticate) {
    auth.authenticate = noop;
  }

  if (!auth.getToken) {
    auth.getToken = noop;
  }

  if (!auth.refreshToken) {
    auth.refreshToken = noop;
  }

  return auth;
}

module.exports = {
    implicitGrantFlow: wrap(require('./implicit-grant-flow')),
    authCodeFlow: wrap(require('./auth-code-flow')),
    authenticatedFlow: wrap(require('./authenticated-flow')),
    clientCredentialsFlow: wrap(require('./client-credentials-flow')),
    refreshTokenFlow: wrap(require('./refresh-token-flow'))
};
