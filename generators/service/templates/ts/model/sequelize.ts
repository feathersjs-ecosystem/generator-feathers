// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const <%= camelName %> = sequelizeClient.define('<%= snakeName %>', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (<%= camelName %> as any).associate = function (models: any) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return <%= camelName %>;
}
