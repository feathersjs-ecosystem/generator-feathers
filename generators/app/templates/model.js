'use strict';
<% for (var i = 0; i < models.length; i++) { %>const <%= models[i] %> = require('./<%= models[i] %>');
<% } %><% if (database.name === 'sqlite') { %>
const path = require('path');
const fs = require('fs-extra');<% } %><% if (database.modelType === 'mongoose') { %>const mongoose = require('mongoose');<% } %><% if (database.modelType === 'sequelize') { %>const Sequelize = require('sequelize');<% } %>

module.exports = function() {
  const app = this;
  <% if (database.name === 'sqlite') { %>
  fs.ensureDirSync( path.dirname(app.get('sqlite')) );
  const sequelize = new Sequelize('feathers', null, null, {
    dialect: 'sqlite',
    storage: app.get('sqlite'),
    logging: false,
    define: {
      freezeTableName: true
    }
  });
  <% } else if (database.modelType === 'sequelize') { %>
  const sequelize = new Sequelize(app.get('<%= database.name %>'), {
    dialect: '<%= database.name %>',
    logging: false,
    define: {
      freezeTableName: true
    }
  });
  <% } else if (database.name === 'mongodb') { %>
  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;
  <% } %><%if (database.modelType === 'sequelize') { %>
  // 1. Configure all models
  app.set('sequelize', sequelize);<% } %><% for (var i = 0; i < models.length; i++) { %>
  app.configure(<%= models[i] %>);<% } %><% if (database.modelType === 'sequelize') { %>
  
  // 2. Set up data relationships
  const models = sequelize.models;
  app.set('models', models);
  Object.keys(models).forEach(name => {
    if ('associate' in models[name]) {
      models[name].associate();
    }
  });

  // 3. Sync to the database
  sequelize.sync();<% } %>
};
