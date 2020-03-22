import { Service, MemoryServiceOptions } from 'feathers-memory';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }
}
