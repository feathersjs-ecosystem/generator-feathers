// <%= name %>-model.ts - A KnexJS
//
// See http://knexjs.org/
// for more of what you can do here.
import { Application } from '../declarations';
import { Knex } from 'knex';

export default function (app: Application): Knex {
  const db: Knex = app.get('knexClient');
  const tableName = '<%= snakeName %>';
  
  db.schema.hasTable(tableName).then(exists => {
    if(!exists) {
      db.schema.createTable(tableName, table => {
        table.increments('id');
      <% if(authentication.strategies.indexOf('local') !== -1) { %>
        table.string('email').unique();
        table.string('password');
      <% } %>
      <% authentication.oauthProviders.forEach(provider => { %>
        table.string('<%= provider %>Id');
      <% }); %>
      })
        .then(() => console.log(`Created ${tableName} table`))
        .catch(e => console.error(`Error creating ${tableName} table`, e));
    }
  });

  return db;
}
