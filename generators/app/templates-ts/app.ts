import path from 'path';
import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import logger from './logger';

import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';
<% if (hasProvider('socketio')) { %>import socketio from '@feathersjs/socketio';<% } %>
<% if (hasProvider('primus')) { %>import primus from '@feathersjs/primus';<% } %>

import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';

const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
<% if (hasProvider('rest')) { %>app.configure(express.rest());<% } %>
<% if (hasProvider('socketio')) { %>app.configure(socketio());<% } %>
<% if(hasProvider('primus')) { %>app.configure(primus({ transformer: 'websockets' }));<% } %>
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger } as any));

app.hooks(appHooks);

export default app;
