import knex from 'knex';
import { Application } from './declarations';

export default (app: Application) => {
  const { client, connection } = app.get('<%= database %>');
  const db = knex({ client, connection });

  app.set('knexClient', db);
}
