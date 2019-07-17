const { Service } = require('feathers-knex');

exports.<%= className %> = class <%= className %> extends Service {
  constructor(options) {
    super({
      ...options,
      name: '<%= snakeName %>'
    });
  }
};
