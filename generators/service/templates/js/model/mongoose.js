// <%= name %>-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const <%= camelName %> = new Schema({
    text: { type: String, required: true }
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://github.com/Automattic/mongoose/issues/1251
  try {
    return mongooseClient.model('<%= camelName %>');
  } catch (e) {
    return mongooseClient.model('<%= camelName %>', <%= camelName %>);
  }
};
