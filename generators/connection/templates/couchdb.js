'use strict';

const cradle = require('cradle');
const service = require('feathers-couchdb');

module.exports = function() {
  const app = this;
  const config = app.get('couchdb');
  

//var Connection = new(cradle.Connection)('http://192.168.1.79:5984')
const Connection = new(cradle.Connection)(config,
    {
        secure: false,
         auth: {
             username: config.dbUsername,
             password: config.dbPassword
        },
        cache: true
    }
);

  app.set('couchdbClient', Connection);
};
