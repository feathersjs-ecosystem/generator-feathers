// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook } from '@feathersjs/feathers';

export default function (options = {}): Hook {
  return async context => {
    return context;
  };
}
