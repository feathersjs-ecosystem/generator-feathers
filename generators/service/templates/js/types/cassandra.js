const { Service } = require('feathers-cassandra');

exports.<%= className %> = class <%= className %> extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model
    });
  }
};
