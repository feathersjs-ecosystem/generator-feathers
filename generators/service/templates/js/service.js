// Initializes the `<%= name %>` service on path `/<%= path %>`
const { <%= className %> } = require('./<%= kebabName %>.class');<% if(modelName) { %>
const createModel = require('<%= relativeRoot %>models/<%= modelName %>');<% } %>
const hooks = require('./<%= kebabName %>.hooks');

module.exports = function (app) {
  const options = {<% if (modelName) { %>
    Model: createModel(app),<% } %><% if (serviceModule === 'feathers-prisma') {%>
    model: '<%= className[0].toLowerCase() + className.substr(1) %>',
    client: app.get('prisma'),<% } %>
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/<%= path %>', new <%= className %>(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('<%= path %>');

  service.hooks(hooks);
};
