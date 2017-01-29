'use strict';

// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function(app) {
  const sequelize = app.get('sequelizeClient');
  const <%= camelName %> = sequelize.define('<%= kebabName %>', {
    text: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  <%= camelName %>.sync();

  return <%= camelName %>;
};
