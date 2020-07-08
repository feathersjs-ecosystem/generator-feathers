import { Service, ObjectionServiceOptions } from 'feathers-objection';
import { Application } from '<%= relativeRoot %>declarations';

interface Options extends ObjectionServiceOptions {
  Model: any;
}

export class <%= className %> extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<Options>, app: Application) {
    const { Model, ...otherOptions } = options;

    super({
      ...otherOptions,
      model: Model
    });
  }
}
