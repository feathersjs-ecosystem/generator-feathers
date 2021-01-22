import { CouchbaseService } from 'feathers-couchbase';

export class <%= className %> extends CouchbaseService {
  constructor (options: any, app: any) {
    super({
      cluster: app.get('couchbaseCluster'),
      name: '<%= camelName %>',
      ...options
    });
  }  
}
