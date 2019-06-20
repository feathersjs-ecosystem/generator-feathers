// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Application } from '@feathersjs/feathers';
import Sequelize from 'sequelize';
const DataTypes = Sequelize.DataTypes;

export default function (app: Application) {
  const sequelizeClient = app.get('sequelizeClient');
  const <%= camelName %> = sequelizeClient.define('<%= snakeName %>', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
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
