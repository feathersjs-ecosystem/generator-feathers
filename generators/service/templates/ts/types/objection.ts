// Initializes the `<%= name %>` service on path `/<%= path %>`
import { Application } from '@feathersjs/feathers';
import createService from '<%= serviceModule %>';
import createModel from '<%= relativeRoot %>models/<%= modelName %>';
import hooks from './<%= kebabName %>.hooks';

export default function (app: Application) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    model: Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('<%= path %>');

  service.hooks(hooks);
}
