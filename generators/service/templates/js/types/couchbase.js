const { CouchbaseService } = require('feathers-couchbase');

exports.<%= className %> = class <%= className %> extends CouchbaseService {
  constructor (options, app) {
    super({
      cluster: app.get('couchbaseCluster'),
      name: '<%= camelName %>',
      ...options
    });
  }
};
