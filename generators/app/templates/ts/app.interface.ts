import { Application, Service } from '@feathersjs/feathers';

interface User {
  id: number;
  username: string;
  password: string;
}

interface ServiceTypes {
  users: Service<User>;
}

export type App = Application<ServiceTypes>;
