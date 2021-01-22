import couchbase from 'couchbase';

export default app => {
  const { host, options } = app.get('couchbase');
  const cluster = new couchbase.Cluster(host, options);

  app.set('couchbaseCluster', cluster);
}
