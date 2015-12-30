import { join } from 'path';
import feathers from 'feathers';
import configuration from 'feathers-configuration';
<% if(providers.indexOf('REST') !== -1) { %>import bodyParser from 'body-parser';<% } %>
import middleware from './middleware';
import services from './services';
import hooks from './hooks';<% if(authentication.length) { %>
import feathersAuth from 'feathers-authentication';<% } %>

const app = feathers();

app.configure(configuration(join(__dirname, '..')))
  <% if(providers.indexOf('REST') !== -1) { %>.configure(feathers.rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  <% } if(providers.indexOf('Socket.io') !== -1) { %>.configure(feathers.socketio())<% } if(providers.indexOf('Primus') !== -1) { %>
  .configure(feathers.primus({
    transformer: 'sockjs'
  }))<% } %><% if(authentication.length) { %>
  .configure(feathersAuth(app.get('auth').local))
  <% } %>.configure(services)
  .configure(hooks)
  .configure(middleware);

export default app;
