/* eslint-disable no-console */

// <%= name %>-model.js - A KnexJS
// 
// See http://knexjs.org/
// for more of what you can do here.
module.exports = function (app) {
  const db = app.get('knexClient');

  db.schema.createTableIfNotExists('<%= kebabName %>', table => {
    table.increments('id');
  <% if(authentication.strategies.indexOf('local') !== -1) { %>
    table.string('email').unique();
    table.string('password');
  <% } %>
  <% authentication.oauthProviders.forEach(provider => { %>
    table.string('<%= provider.name %>Id');
  <% }); %>
  })
  .then(() => console.log('Updated <%= kebabName %> table'))
  .catch(e => console.error('Error updating <%= kebabName %> table', e));

  return db;
};
