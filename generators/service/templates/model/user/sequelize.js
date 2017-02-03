'use strict';

// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function(app) {
  const sequelizeClient = app.get('sequelizeClient');
  const <%= camelName %> = sequelizeClient.define('<%= kebabName %>', {
    <% if(providers.local) { %>
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    <% } %>
    <% Object.keys(providers).forEach(provider => { if(provider !== 'local') %>
    <%= provider %>Id: { type: Sequelize.STRING },
    <% } }); %>
  }, {
    classMethods: {
      associate (models) {
      	// Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/
      }
    }
  });

  return <%= camelName %>;
};
