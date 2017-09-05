import * as authentication from 'feathers-authentication';
import * as  jwt from 'feathers-authentication-jwt';
<% if(strategies.indexOf('local') !== -1) { %>import * as local from 'feathers-authentication-local';<% } %>
<% if(oauthProviders.length){ %>import * as oauth2 from 'feathers-authentication-oauth2';<% } %>
<% oauthProviders.forEach(provider => { %>import * as <%= provider.strategyName %> from '<%= provider.module %>';
<% }); %>

export default function () {
  const app = this;
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());<% if(strategies.indexOf('local') !== -1) { %>
  app.configure(local(config.local));<% } %>
<% oauthProviders.forEach(provider => { %>
  app.configure(oauth2(Object.assign({
    name: '<%= provider.name %>',
    Strategy: <%= provider.strategyName %>
  }, config.<%= provider.name %>)));
<% }); %>
  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        authentication.hooks.authenticate(config.strategies)
      ],
      remove: [
        authentication.hooks.authenticate('jwt')
      ]
    }
  });
};
