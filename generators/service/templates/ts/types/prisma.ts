import { PrismaService, PrismaServiceOptions } from 'feathers-prisma';
import { Application } from '<%= relativeRoot %>declarations';
import { PrismaClient } from '@prisma/client';

interface Options extends PrismaServiceOptions {
  client: PrismaClient;
}

export class <%= className %> extends PrismaService {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor({ client, ...options }: Options, app: Application) {
    super({
      ...options,
    }, client);
  }
}
