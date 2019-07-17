// Initializes the `<%= name %>` service on path `/<%= path %>`
import { Application } from '../../declarations';
import createService from 'feathers-mongodb';
import hooks from './<%= kebabName %>.hooks';

export default function (app: Application) {
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('<%= path %>');

  mongoClient.then(db => {
    service.Model = db.collection('<%= kebabName %>');
  });

  service.hooks(hooks);
}
