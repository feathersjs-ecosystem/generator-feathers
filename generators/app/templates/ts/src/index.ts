import logger from './logger';
import app from './app';

const hostname = app.get('host');
const port = app.get('port');
const server = app.listen(port, hostname);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', () =>
  logger.info('Feathers application started on http://%s:%d', hostname, port)
);
