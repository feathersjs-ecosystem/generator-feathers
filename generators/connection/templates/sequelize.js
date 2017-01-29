'use strict';

const Sequelize = require('sequelize');

module.exports = function() {
  const app = this;
  const connectionString = app.get('sequelize');
  const sequelize = new Sequelize(connectionString);

  app.set('sequelizeClient', sequelize);
};
