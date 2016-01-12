import { static as host } from 'feathers';
import errors from 'feathers-errors';
import errorHandler from './error-handler';
import logger from './logger';

export default function() {
  const app = this;

  app.use('/', host(app.get('public')));
  app.use(function(req, res, next) {
    next(new errors.NotFound('Page not found'));
  });
  app.use(logger);
  app.use(errorHandler);
}
