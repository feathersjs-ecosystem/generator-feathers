const { Model } = require('objection');
import { Application } from './app.interface';

export default function (app: Application) {
  const { client, connection } = app.get('<%= database %>');
  const knex = require('knex')({ client, connection, useNullAsDefault: false });

  Model.knex(knex);

  app.set('knex', knex);
}
