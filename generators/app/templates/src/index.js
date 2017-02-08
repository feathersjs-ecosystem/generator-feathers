/* eslint-disable no-console */
'use strict';

const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  app.logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  app.logger.info(`Feathers application started on ${app.get('host')}:${port}`)
);
