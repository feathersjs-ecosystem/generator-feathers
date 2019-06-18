// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Application } from '@feathersjs/feathers';
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

export default function (app: Application) {
  const sequelizeClient = app.get('sequelizeClient');
  const <%= camelName %> = sequelizeClient.define('<%= snakeName %>', {
  <% if(authentication.strategies.indexOf('local') !== -1) { %>
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
  <% } %>
  <% authentication.oauthProviders.forEach(provider => { %>
    <%= provider.name %>Id: { type: Sequelize.STRING },
  <% }); %>
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  <%= camelName %>.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return <%= camelName %>;
}
