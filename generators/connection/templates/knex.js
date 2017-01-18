'use strict';

const knex = require('knex');

module.exports = function() {
  const app = this;
  const { client, connection } = app.get('knex');
  const db = knex({ client, connection });

  app.set('knexClient', db);
};
