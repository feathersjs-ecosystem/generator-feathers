import { Application } from '@feathersjs/feathers';
import NeDB from 'nedb';
import path from 'path';

export default function (app: Application) {
  const dbPath = app.get('nedb');
  const Model = new NeDB({
    filename: path.join(dbPath, '<%= kebabName %>.db'),
    autoload: true
  });

  Model.ensureIndex({ fieldName: 'email', unique: true });

  return Model;
}
