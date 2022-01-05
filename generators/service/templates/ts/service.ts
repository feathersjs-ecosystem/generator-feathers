// Initializes the `<%= name %>` service on path `/<%= path %>`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '<%= relativeRoot %>declarations';
import { <%= className %> } from './<%= kebabName %>.class';<% if(modelName) { %>
import createModel from '<%= relativeRoot %>models/<%= modelName %>';<% } %>
import hooks from './<%= kebabName %>.hooks';

// Add this service to the service type index
declare module '<%= relativeRoot %>declarations' {
  interface ServiceTypes {
    '<%= path %>': <%= className %> & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
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
}
