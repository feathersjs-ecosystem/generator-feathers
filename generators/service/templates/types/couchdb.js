// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('feathers-couchdb');
const hooks = require('./<%= kebabName %>.hooks');
const filters = require('./<%= kebabName %>.filters');

module.exports = function() {
  const app = this;
  const Connection = app.get('couchdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: '<%= kebabName %>',
    connection: Connection,
    Model: '<%= kebabName %>'
    // paginate
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('<%= path %>');

  service.hooks(hooks);

  if(service.filter) {
    service.filter(filters);
  }
};
