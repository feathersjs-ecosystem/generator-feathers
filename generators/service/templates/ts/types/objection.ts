import { Service, ObjectionServiceOptions } from 'feathers-objection';

interface Options extends ObjectionServiceOptions {
  Model: any;
}

export class <%= className %> extends Service {
  constructor(options: Partial<Options>, app: Application) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model
    });
  }
}
