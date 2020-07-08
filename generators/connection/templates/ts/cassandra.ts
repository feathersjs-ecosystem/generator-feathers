import ExpressCassandra from 'express-cassandra';
import FeathersCassandra from 'feathers-cassandra';
import Cassanknex from 'cassanknex';
import { Application } from './declarations';

export default function (app: Application): void {
  const connectionInfo = app.get('<%= database %>');
  const models = ExpressCassandra.createClient(connectionInfo);
  const cassandraClient = models.orm.get_system_client();

  app.set('models', models);

  cassandraClient.connect((err: any) => {
    if (err) throw err;

    const cassanknex = Cassanknex({ connection: cassandraClient });

    FeathersCassandra.cassanknex(cassanknex);

    cassanknex.on('ready', (err: any) => {
      if (err) throw err;
    });

    app.set('cassanknex', cassanknex);
  });
}
