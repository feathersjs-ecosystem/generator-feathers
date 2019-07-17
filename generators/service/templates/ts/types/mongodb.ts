import { Service, MongoDBServiceOptions } from 'feathers-mongodb';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  constructor(options: Partial<MongoDBServiceOptions>, app: Application) {
    super(options);
    
    app.get('mongoClient').then(db => {
      this.Model = db.collection('<%= kebabName %>');
    });
  }
};
