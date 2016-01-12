import { join } from 'path';
import { static } from 'feathers';
import favicon from 'serve-favicon';
import compress from 'compression';
import errors from 'feathers-errors';
import errorHandler from './error-handler';
import logger from './logger';

export default function() {
  const app = this;

  app.use(compress())
  app.use(favicon( join(app.get('public'), 'favicon.ico') ))
  app.use('/', static(app.get('public')));
  app.use(function(req, res, next) {
    next(new errors.NotFound('Page not found'));
  });
  app.use(logger);
  app.use(errorHandler);
}
