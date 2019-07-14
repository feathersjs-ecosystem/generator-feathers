import { Application as ExpressFeathers } from '@feathersjs/express';
import { Service } from '@feathersjs/feathers';
import '@feathersjs/transport-commons';

// List of packages that don't have typings yet
declare module 'express-cassandra';
declare module 'feathers-cassandra';
declare module 'mongodb-core';

export type Application = ExpressFeathers<{
  [key: string]: Service<any>;
}>;