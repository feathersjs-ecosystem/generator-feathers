'use strict';

const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const logger = require('./logger');

module.exports = function() {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;

  app.use(notFound());
  app.use(logger(app));
  app.use(handler());
};
