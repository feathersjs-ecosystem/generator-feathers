'use strict';

const winston = require('winston');

module.exports = function() {
  const app = this; // eslint-disable-line no-unused-vars
  app.logger = winston;

  app.hooks({
    before(hook) {
      const message = `BEFORE Route: ${hook.path} - Method: ${hook.method}`;

      app.logger.info(message);
      app.logger.info('hook.data', hook.data);
      app.logger.info('hook.params', hook.params);
    },
    error(hook) {
      const error = hook.error;
      const message = `${error.code ? `(${error.code}) ` : '' }Route: ${hook.path} - Method: ${hook.method} - ${error.message}`;

      if (error.code === 404) {
        app.logger.info(message);  
      }
      else {
        app.logger.error(message);
        app.logger.info(error.stack);
      }
    },
    after(hook) {
      const message = `AFTER Route: ${hook.path} - Method: ${hook.method}`;

      app.logger.info(message);
      app.logger.info('hook.data', hook.data);
      app.logger.info('hook.params', hook.params);
      app.logger.info('hook.result', hook.result);
    },
  });
};
