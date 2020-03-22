import logger from './logger';
import app from './app';

const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p): void =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);

server.on('listening', (): void =>
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
);
