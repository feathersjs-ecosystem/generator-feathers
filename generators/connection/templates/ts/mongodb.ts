import { parseConnectionString as parse } from 'mongodb-core';
import { MongoClient } from 'mongodb';
import { Application } from './declarations';
const logger = require('./logger');

export default function (app: Application) {
  const config = app.get('mongodb');
  const promise = MongoClient.connect(config, { useNewUrlParser: true }).then(client => {
    // For mongodb <= 2.2
    if((client as any).collection) {
      return client;
    }

    const dbName = parse(config, () => {});
    return client.db(dbName);
  }).catch(error => {
    logger.error(error);
  });

  app.set('mongoClient', promise);
}
