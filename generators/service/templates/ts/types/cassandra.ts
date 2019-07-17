import { Service } from 'feathers-cassandra';

export class <%= className %> extends Service {
  constructor(options) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model
    });
  }
}
