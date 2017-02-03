'use strict';

// <%= name %>-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient');
  const <%= camelName %> = new mongooseClient.Schema({
    <% if(providers.local) { %>
    email: {type: String, required: true, unique: true},
    password: { type: String, required: true },
    <% } %>
    <% Object.keys(providers).forEach(provider => { if(provider !== 'local') %>
    <%= provider %>Id: { type: String },
    <% } }); %>
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  return mongooseClient.model('<%= camelName %>', <%= camelName %>);
};
