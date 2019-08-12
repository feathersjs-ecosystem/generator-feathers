import { Service, MemoryServiceOptions } from 'feathers-memory';
import { Application } from '<%= relativeRoot %>app.interface';

export class <%= className %> extends Service {
  constructor(options: Partial<MemoryServiceOptions>, app: Application) {
    super(options);
  }
}
