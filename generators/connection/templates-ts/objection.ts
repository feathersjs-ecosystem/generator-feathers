import { Application } from '@feathersjs/feathers';
const { Model } = require('objection');

export default function (app: Application) {
  const { client, connection } = app.get('<%= database %>');
  const knex = require('knex')({ client, connection, useNullAsDefault: false });

  Model.knex(knex);

  app.set('knex', knex);
}
