import { MongoClient } from 'mongodb';
import { Application } from './declarations';

export default function (app: Application) {
  const config = app.get('mongodb');
  
  const mongoClient = MongoClient.connect(config, { useNewUrlParser: true });

  app.set('mongoClient', mongoClient);
}
