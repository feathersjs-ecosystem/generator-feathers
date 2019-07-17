const { Service } = require('feathers-objection');

exports.<%= className %> = class <%= className %> extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model
    });
  }
};
