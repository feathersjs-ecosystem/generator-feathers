const couchbase = require('couchbase');

module.exports = app => {
  const { host, options } = app.get('couchbase');
  const cluster = new couchbase.Cluster(host, options);

  app.set('couchbaseCluster', cluster);
};
