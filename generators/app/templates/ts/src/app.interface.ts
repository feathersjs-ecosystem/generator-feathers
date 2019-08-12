import { Service } from '@feathersjs/feathers';
import { Application as ExpressFeathers } from '@feathersjs/express';
import '@feathersjs/transport-commons';
// Don't remove this comment. It's needed to format import lines nicely.

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {
}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;
