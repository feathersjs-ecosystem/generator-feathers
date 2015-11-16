import feathers from 'feathers';
<% if(providers.indexOf('REST') !== -1) { %>
import bodyParser from 'body-parser';
<% } %>
import middleware from './middleware';
import services from './services';
import hooks from './hooks';
import authentication from './authentication';

const app = feathers()
  <% if(providers.indexOf('REST') !== -1) { %>
  .configure(feathers.rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  <% } %>
  <% if(providers.indexOf('Socket.io') !== -1) { %>
  .configure(feathers.socketio())
  <% } %>
  <% if(providers.indexOf('Primus') !== -1) { %>
  .configure(feathers.primus({
    transformer: 'sockjs'
  }))
  <% } %>
  .configure(authentication)
  .configure(services)
  .configure(hooks)
  .configure(middleware);

export default app;
