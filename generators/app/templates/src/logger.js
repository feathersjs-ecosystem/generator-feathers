const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(format.splat(), format.simple()),
  transports: [new transports.Console()]
});

// To see more detailed messages, uncomment the following line:
// logger.level = 'debug';

module.exports = logger;
