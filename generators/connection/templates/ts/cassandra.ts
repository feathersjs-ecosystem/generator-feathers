import ExpressCassandra from 'express-cassandra';
import FeathersCassandra from 'feathers-cassandra';
import { Application } from './app.interface';

export default function (app: Application) {
  const connectionInfo = app.get('<%= database %>');
  const models = ExpressCassandra.createClient(connectionInfo);
  const cassandraClient = models.orm.get_system_client();

  app.set('models', models);

  cassandraClient.connect((err: any) => {
    if (err) throw err;

    const cassanknex = require('cassanknex')({ connection: cassandraClient });

    FeathersCassandra.cassanknex(cassanknex);

    cassanknex.on('ready', (err: any) => {
      if (err) throw err;
    });

    app.set('cassanknex', cassanknex);
  });
}
