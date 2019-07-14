import { Application as FeathersApplication, Service } from '@feathersjs/feathers';
import '@feathersjs/transport-commons';

// List of packages that don't have typings yet
declare module 'express-cassandra';
declare module 'feathers-cassandra';
declare module 'mongodb-core';

export type Application = FeathersApplication<{
  [key: string]: Service<any>;
}>;