'use strict';

const rethinkdbdash = require('rethinkdbdash');

module.exports = function() {
  const app = this;
  const config = app.get('rethinkdb');
  const r = rethinkdbdash(config);
  const oldSetup = app.setup;

  app.set('rethinkdbClient', r);

  app.setup = function(...args) {
    const result = oldSetup.apply(this, args);
    
    let promise = Promise.resolve();

    // Go through all services and call the RethinkDB `init`
    // which creates the database and tables if they do not exist
    Object.keys(app.services).forEach(path => {
      const service = app.service(path);

      if(typeof service.init === 'function') {
        promise = promise.then(() => service.init());
      }
    });

    return result;
  };
};
