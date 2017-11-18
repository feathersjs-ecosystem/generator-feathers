const logger = require('winston');

module.exports = function () {
  // A middleware that logs non-Feathers service middleware errors
  return function errorLogger(err, req, res, next) {
    // If there is a res.hook property this was a service call and the error
    // has already been logged via `hooks/logger.js`
    if(!res.hook) {
      logger.error(err);
    }
    
    next();
  };
};
