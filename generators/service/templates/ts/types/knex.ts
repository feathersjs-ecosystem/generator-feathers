import { Service, KnexServiceOptions } from 'feathers-knex';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  constructor(options: Partial<KnexServiceOptions>, app: Application) {
    super({
      ...options,
      name: '<%= snakeName %>'
    });
  }
}
