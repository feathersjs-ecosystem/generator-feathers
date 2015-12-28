var feathersAuth = require('feathers-authentication').default;

export default feathersAuth({
  secret: 'TODO-generate-random-key',
  loginEndpoint: '/login',
  userEndpoint: '/users',
  usernameField: 'email'
});
