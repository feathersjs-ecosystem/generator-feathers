import errorHandler from './error';
import { static as staticFiles } from 'feathers';

export default function() {
  const app = this;

  app.use('/', staticFiles(app.get('public')))
    .use(errorHandler);
}
