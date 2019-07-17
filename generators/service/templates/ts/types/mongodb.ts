import { Service } from 'feathers-mongodb';
import { Application } from '<%= relativeRoot %>declarations';

export class <%= className %> extends Service {
  setup(app: Application) {
    app.get('mongoClient').then(db => {
      this.Model = db.collection('<%= kebabName %>');
    });
  }
};
