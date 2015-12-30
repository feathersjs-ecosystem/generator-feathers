import { join } from 'path';
import feathers from 'feathers';
import configuration from 'feathers-configuration';
<% if(providers.indexOf('REST') !== -1) { %>import bodyParser from 'body-parser';<% } %>
import middleware from './middleware';
import services from './services';
import hooks from './hooks';<% if(authentication.length) { %>
import feathersAuth from 'feathers-authentication';<% } %><% if(cors) { %>
import cors from 'cors';<% } %>

let app = feathers();<% if (cors === 'whitelisted') { %>
let whitelist = app.get('corsWhitelist');
let corsOptions = {
  origin: function(origin, callback){
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};<% } %>

app.configure(configuration(join(__dirname, '..')))
  <% if(providers.indexOf('REST') !== -1) { %>.configure(feathers.rest())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))<% } if (cors) { %>
  .options('*', cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))
  .use(cors(<% if (cors === 'whitelisted') { %>corsOptions<% } %>))
  <% } if(providers.indexOf('Socket.io') !== -1) { %>.configure(feathers.socketio())<% } if(providers.indexOf('Primus') !== -1) { %>
  .configure(feathers.primus({
    transformer: 'sockjs'
  }))<% } %><% if(authentication.length) { %>
  .configure(feathersAuth(app.get('auth').local))
  <% } %>.configure(services)
  .configure(hooks)
  .configure(middleware);

export default app;
