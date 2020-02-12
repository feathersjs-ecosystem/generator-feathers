const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
<% if(strategies.includes('local')) { %>const { LocalStrategy } = require('@feathersjs/authentication-local');<% } %>
const { expressOauth } = require('@feathersjs/authentication-oauth');

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
<% if(strategies.includes('local')) { %>  authentication.register('local', new LocalStrategy());<% } %>

  app.use('/authentication', authentication);
  app.configure(expressOauth());
};
