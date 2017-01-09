'use strict';

// Initializes the `<%= name %>` service on path `/<%= path %>`
const NeDB = require('nedb');
const path = require('path');

const createService = require('<%= serviceModule %>');
const hooks = require('./<%= kebabName %>.hooks');
const filters = require('./<%= kebabName %>.filters');

module.exports = function() {
  const app = this;
  const paginate = app.get('paginate');
  // Create a NeDB instance
  const Model = new NeDB({
    filename: path.join(app.get('nedb'), `<%= kebabName %>.json`),
    autoload: true
  });
  const options = {
    paginate,
    Model
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
