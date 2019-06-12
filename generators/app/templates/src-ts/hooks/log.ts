// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
import logger from '../logger';
import util from 'util';
import { Hook } from '@feathersjs/feathers';

// To see more detailed messages, uncomment the following line:
// logger.level = 'debug';

export default function (): Hook {
  return context => {
    // This debugs the service call and a stringified version of the hook context
    // You can customize the message (and logger) to your needs
    logger.debug(`${context.type} app.service('${context.path}').${context.method}()`);
    
    if(typeof (context as any).toJSON === 'function' && logger.level === 'debug') {
      logger.debug('Hook Context', util.inspect(context, {colors: false}));
    }
    
    if(context.error && !context.result) {
      logger.error(context.error.stack);
    }
  };
}
