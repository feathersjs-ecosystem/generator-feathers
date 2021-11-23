// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
import { Model, JSONSchema } from 'objection';
import { Knex } from 'knex';
import { Application } from '../declarations';

class <%= className %> extends Model {
  createdAt!: string;
  updatedAt!: string;

  static get tableName(): string {
    return '<%= snakeName %>';
  }

  static get jsonSchema(): JSONSchema {
    return {
      type: 'object',
      required: ['text'],

      properties: {
        text: { type: 'string' }
      }
    };
  }

  $beforeInsert(): void {
    this.createdAt = this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}

export default function (app: Application): typeof <%= className %> {
  const db: Knex = app.get('knex');

  db.schema.hasTable('<%= snakeName %>').then(exists => {
    if (!exists) {
      db.schema.createTable('<%= snakeName %>', table => {
        table.increments('id');
        table.string('text');
        table.timestamp('createdAt');
        table.timestamp('updatedAt');
      })
        .then(() => console.log('Created <%= snakeName %> table')) // eslint-disable-line no-console
        .catch(e => console.error('Error creating <%= snakeName %> table', e)); // eslint-disable-line no-console
    }
  })
    .catch(e => console.error('Error creating <%= snakeName %> table', e)); // eslint-disable-line no-console

  return <%= className %>;
}
