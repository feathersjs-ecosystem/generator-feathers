const MongoClient = require('mongodb').MongoClient;

module.exports = function (app) {
  const config = app.get('mongodb');
  const promise = MongoClient.connect(config)
    .then(client => {
        if(client.collection) { return client } // mongodb <= 2.2
        return client.db(client.s.options.dbName)
      });

  app.set('mongoClient', promise);
};
