// See https://vincit.github.io/objection.js/#models
// for more of what you can do here.
import { Model, JSONSchema } from 'objection';
import Knex from 'knex';
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
      required: ['password'],

      properties: {
      <% if(authentication.strategies.indexOf('local') !== -1) { %>
        email: { type: ['string', 'null'] },
        password: { type: 'string' },
      <% } %><% authentication.oauthProviders.forEach(provider => { %>
        <%= provider %>Id: { type: 'string' },
      <% }); %>
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
      <% if(authentication.strategies.indexOf('local') !== -1) { %>
        table.string('email').unique();
        table.string('password');
      <% } %>
      <% authentication.oauthProviders.forEach(provider => { %>
        table.string('<%= provider %>Id');
      <% }); %>
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
