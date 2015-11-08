import home  from './home';
import errorHandler from './error';

export default function() {
  const app = this;

  app.get('/', home)
    .use(errorHandler);
}
