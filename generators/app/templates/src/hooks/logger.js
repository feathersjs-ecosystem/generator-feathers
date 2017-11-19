// A hook that logs service method before, after and error
// See https://github.com/winstonjs/winston for documentation
// about the logger.
const logger = require('winston');

// To see more debug messages uncomment the following line
// logger.level = 'debug';

// These two methods are recreating a JSON representation of the service call
// you can customize it to whatever you need
const json = value => JSON.stringify(value, null, '  ');
const createMessage = context => {
  let message = `${context.type} app.service('${context.path}').${context.method}(`;

  if(context.id !== undefined) {
    message += `${json(context.id)}, `;
  }

  if(context.data !== undefined) {
    message += `${json(context.data)}, `;
  }

  message += `${json(context.params)})`;

  return message;
};

module.exports = function () {
  return context => {
    logger.debug(createMessage(context));

    if(context.result !== undefined) {
      logger.debug(`result: ${json(context.result)}`);
    }
    
    if (context.error) {
      logger.error(context.error);
    }
  };
};
