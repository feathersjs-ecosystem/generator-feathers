/* eslint-disable no-console */
import * as logger from 'winston';
import { app } from './app';
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on %s:%d', app.get('host'), port)
);
