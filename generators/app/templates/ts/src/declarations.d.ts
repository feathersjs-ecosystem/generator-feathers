import { Application as ExpressFeathers } from '@feathersjs/express';
import { Service } from '@feathersjs/feathers';
import '@feathersjs/transport-commons';

// List of packages that don't have typings yet
declare module 'express-cassandra';
declare module 'feathers-cassandra';
declare module 'mongodb-core';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;
