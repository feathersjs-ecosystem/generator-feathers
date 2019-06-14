import { Application } from '@feathersjs/feathers';
import knex from 'knex';

export default function (app: Application) {
  const { client, connection } = app.get('<%= database %>');
  const db = knex({ client, connection });

  app.set('knexClient', db);
}
