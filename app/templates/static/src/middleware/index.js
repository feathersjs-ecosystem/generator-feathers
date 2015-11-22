import errorHandler from './error';
import { errors } from 'feathers';
import { static as host } from 'feathers';

export default function() {
  const app = this;

  app.use('/', host(app.get('public')));
  app.use(function(req, res, next) {
    next(new errors.types.NotFound('Page not found'));
  });
  app.use(errorHandler);
}
