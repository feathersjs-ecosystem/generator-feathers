'use strict';

const authentication = require('feathers-authentication');

module.exports = function() {
  const app = this;
  const { secret, strategies } = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication({ secret }));

  // the `authentication` service is used to create a JWT
  // the before `create` hook registers strategies that can be used
  // create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
