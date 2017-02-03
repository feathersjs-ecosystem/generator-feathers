'use strict';

const authentication = require('feathers-authentication');
<% if(providers.google) { %>const GoogleStrategy = require('passport-google-oauth20').Strategy;<% } %>
<% if(providers.facebook) { %>const FacebookStrategy = require('passport-facebook').Strategy;<% } %>
<% if(providers.github) { %>const GithubStrategy = require('passport-github').Strategy;<% } %>

module.exports = function() {
  const app = this;
  const config = app.get('authentication');
  const { secret, strategies } = config;

  // Set up authentication with the secret
  app.configure(authentication({ secret }));
  <% if(providers.google) { %>app.configure(oauth2(Object.assign({
    name: 'google',
    Strategy: GoogleStrategy
  }, config.google)));<% } %>
  <% if(providers.facebook) { %>app.configure(oauth2(Object.assign({
    name: 'facebook',
    Strategy: FacebookStrategy
  }, config.facebook)));<% } %>
  <% if(providers.github) { %>app.configure(oauth2(Object.assign({
    name: 'github',
    Strategy: GithubStrategy
  }, config.github)));<% } %>

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
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
