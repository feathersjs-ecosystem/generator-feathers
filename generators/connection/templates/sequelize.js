'use strict';

const Sequelize = require('sequelize');

module.exports = function() {
  const app = this;
  const { database, username, password, options } = app.get('sequelize');
  const sequelize = new Sequelize(database, username, password, options);

  app.set('sequelizeClient', sequelize);
};
