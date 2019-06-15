// <%= name %>-model.js - A KnexJS
// 
// See http://knexjs.org/
// for more of what you can do here.
import { Application } from '@feathersjs/feathers';

export default function (app: Application) {
  const db = app.get('knexClient');
  const tableName = '<%= snakeName %>';
  db.schema.hasTable(tableName).then(exists => {
    if(!exists) {
      db.schema.createTable(tableName, table => {
        table.increments('id');
        table.string('text');
      })
        .then(() => console.log(`Created ${tableName} table`))
        .catch(e => console.error(`Error creating ${tableName} table`, e));
    }
  });
  

  return db;
}
