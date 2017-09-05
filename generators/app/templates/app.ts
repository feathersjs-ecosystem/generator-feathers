import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as compress from 'compression';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';

import * as feathers from 'feathers';
import * as configuration from 'feathers-configuration';
import * as hooks from 'feathers-hooks';
<% if (hasProvider('rest')) { %>import * as rest from 'feathers-rest';<% } %>
<% if (hasProvider('socketio')) { %>import * as socketio from 'feathers-socketio';<% } %>
<% if (hasProvider('primus')) { %>import * as primus from 'feathers-primus';<% } %>
import * as handler from 'feathers-errors/handler';
import * as notFound from 'feathers-errors/not-found';

import * as middleware from './middleware';
import * as services from './services';
import * as appHooks from './app.hooks';

export const app = feathers();

// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

// Set up Plugins and providers
app.configure(hooks());
<% if (hasProvider('rest')) { %>app.configure(rest());<% } %>
<% if (hasProvider('socketio')) { %>app.configure(socketio());<% } %>
<% if(hasProvider('primus')) { %>app.configure(primus({ transformer: 'websockets' }));<% } %>
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(handler());

app.hooks(appHooks);

