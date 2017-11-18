// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
const logger = require('winston');

// To see more debug messages uncomment the following line
// logger.configure({ level: 'debug' });

module.exports = function () {
  return context => {
    const { data, id, params, result } = context;
    let message = `${context.type}: ${context.path} - Method: ${context.method}`;
    
    logger.debug(message);
    logger.debug('Hook context', { data, id, params, result });

    if (context.error) {
      logger.error(context.error);
    }
  };
};
