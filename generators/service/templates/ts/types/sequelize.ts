import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
