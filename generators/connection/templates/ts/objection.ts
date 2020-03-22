const { Model } = require('objection');
import { Application } from './declarations';

export default function (app: Application): void {
  const { client, connection } = app.get('<%= database %>');
  const knex = require('knex')({ client, connection, useNullAsDefault: false });

  Model.knex(knex);

  app.set('knex', knex);
}
