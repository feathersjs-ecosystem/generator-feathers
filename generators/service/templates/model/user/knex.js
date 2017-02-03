'use strict';

// <%= name %>-model.js - A KnexJS
// 
// See http://knexjs.org/
// for more of what you can do here.
module.exports = function(app) {
  const db = app.get('knexClient');

  db.schema.createTableIfNotExists('<%= kebabName %>', table => {
    table.increments('id');
    <% if(providers.local) { %>
    table.string('email').unique();
    table.string('password');
    <% } %>
    <% Object.keys(providers).forEach(provider => { if(provider !== 'local') %>
    table.string('<%= provider %>Id');
    <% } }); %>
  })
  .then(() => console.log('Updated <%= kebabName %> table'))
  .catch(e => console.error('Error updating <%= kebabName %> table', e));

  return db;
};
