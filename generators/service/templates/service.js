// Initializes the `<%= name %>` service on path `/<%= path %>`
const createService = require('<%= serviceModule %>');<% if(modelName) { %>
const createModel = require('<%= modelName %>');<% } %>
const hooks = require('./<%= kebabName %>.hooks');
<% // Choose the correct service name depending on the model being used %>
module.exports = function (app) {
  <% if (modelName) { %>const Model = createModel(app);<% } %>
  const paginate = app.get('paginate');

  const options = {<% switch(adapter.toLowerCase()) {
    case 'mongodb':
    case 'mongoose': %>
    name: '<%= dotCamelName %>',<% break; %>
    <% case 'sequelize':
    case 'knex': %>
    name: '<%= snakeName %>',<% break; %>
    <% default: %> name: '<%= kebabName %>',<% break; } if (modelName) { %>
    Model,<% } %>
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('<%= path %>');

  service.hooks(hooks);
};
