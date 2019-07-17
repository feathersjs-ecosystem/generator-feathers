import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
