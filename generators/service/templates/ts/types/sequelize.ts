import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
