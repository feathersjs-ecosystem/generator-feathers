import knex from 'knex';
import { Application } from './app.interface';

export default function (app: Application) {
  const { client, connection } = app.get('<%= database %>');
  const db = knex({ client, connection });

  app.set('knexClient', db);
}
