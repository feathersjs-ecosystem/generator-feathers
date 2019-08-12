import { Service, MongooseServiceOptions } from 'feathers-mongoose';
import { Application } from '<%= relativeRoot %>app.interface';

export class <%= className %> extends Service {
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
  }
}
