import { PrismaService, PrismaServiceOptions } from 'feathers-prisma';
import { Application } from '<%= relativeRoot %>declarations';

interface Options extends PrismaServiceOptions {}

export class <%= className %> extends PrismaService {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Options, app: Application) {
    super(options, app.get('prisma'));
  }
}
