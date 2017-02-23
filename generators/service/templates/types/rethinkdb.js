'use strict';

// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('feathers-rethinkdb');
const hooks = require('./<%= kebabName %>.hooks');
const filters = require('./<%= kebabName %>.filters');

module.exports = function() {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: '<%= snakeName %>',
    Model,
    paginate
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
