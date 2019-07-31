import url from 'url';
import Sequelize from 'sequelize';
import { Application } from './declarations';

export default function (app: Application) {
  const connectionString = app.get('mssql');
  const connection = url.parse(connectionString);
  const database = connection.path.substring(1, connection.path.length);
  const { port, hostname } = connection;
  const [ username, password ] = (connection.auth || ':').split(':');
  const sequelize = new Sequelize(database, username, password, {
    dialect: 'mssql',
    host: hostname,
    logging: false,
    operatorsAliases: false,
    define: {
      freezeTableName: true
    },
    dialectOptions: {
      port,
      instanceName: 'NameOfTheMSSQLInstance'
    }
  });

  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args) {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach(name => {
      if ('associate' in models[name]) {
        models[name].associate(models);
      }
    });

    // Sync to the database
    app.set('sequelizeSync', sequelize.sync());

    return result;
  };
}
