// <%= name %>-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations';

export default (app: Application) => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const <%= camelName %> = new Schema({
    text: { type: String, required: true }
  }, {
    timestamps: true
  });

  return mongooseClient.model('<%= camelName %>', <%= camelName %>);
}
