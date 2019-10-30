const MongoClient = require('mongodb').MongoClient;

module.exports = function (app) {
  const config = app.get('mongodb');
  const mongoClient = MongoClient.connect(config, { useNewUrlParser: true });

  app.set('mongoClient', mongoClient);
};
