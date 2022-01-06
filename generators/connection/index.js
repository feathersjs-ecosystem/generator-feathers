const { snakeCase } = require('lodash');
const url = require('url');
const { transform, ts } = require('@feathersjs/tools');
const Generator = require('../../lib/generator');

module.exports = class ConnectionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.dependencies = [];
    this.devDependencies = [];
  }

  _transformCode (code) {
    const { adapter } = this.props;

    const ast = transform(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureMiddleware = ast.findConfigure('middleware');
    const requireCall = `const ${adapter} = require('./${adapter}');`;

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.js to insert database configuration. Did you modify app.js?');
    }

    if (configureMiddleware.length === 0) {
      throw new Error('Could not find .configure(middleware) call in app.js after which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureMiddleware.insertBefore(`app.configure(${adapter});`);

    return ast.toSource();
  }

  _transformCodeTs (code) {
    const { adapter } = this.props;

    const ast = transform(code, {
      parser: ts
    });
    const appDeclaration = ast.findDeclaration('app');
    const configureMiddleware = ast.findConfigure('middleware');
    const requireCall = `import ${adapter} from './${adapter}';`;

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.ts to insert database configuration. Did you modify app.js?');
    }

    if (configureMiddleware.length === 0) {
      throw new Error('Could not find .configure(middleware) call in app.ts after which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureMiddleware.insertBefore(`app.configure(${adapter});`);

    return ast.toSource();
  }

  _transformModuleDeclarations () {
    // TODO
    // const filePath = this.destinationPath(this.libDirectory, 'declarations.d.ts');
    // const ast = j(this.fs.read(filePath).toString());
    // const moduleDeclarations = ast.find(j.TSModuleDeclaration);
  }

  _getConfiguration () {
    const sqlPackages = {
      mysql: 'mysql2',
      mssql: 'mssql',
      postgres: 'pg',
      sqlite: 'sqlite3'
      // oracle: 'oracle'
    };

    const { connectionString, database, adapter } = this.props;
    let parsed = {};

    if (adapter === 'objection') {
      this.dependencies.push('knex');
    } else if (adapter === 'cassandra') {
      this.dependencies.push('express-cassandra');
      this.dependencies.push('cassanknex');
    } else if (adapter === 'sequelize') {	
      if (this.srcType === 'ts') {	
        this.devDependencies.push('@types/validator@^10.0.0');	
      }	
    } else if (adapter === 'prisma') {
      this.dependencies.push('@prisma/client');
      this.devDependencies.push('prisma');
    }

    switch (database) {
    case 'nedb':
      this.dependencies.push('@seald-io/nedb');
      return connectionString.substring(7, connectionString.length);

    case 'memory':
      return null;

    case 'mongodb':
      if (adapter !== 'prisma') {
        this.dependencies.push(adapter);
        this.dependencies.push('mongodb-core');
      }
      return connectionString;

    case 'mysql':
    case 'mssql':
    // case oracle:
    case 'postgres': // eslint-disable-line no-fallthrough
    case 'sqlite':
      if (adapter !== 'prisma') {
        this.dependencies.push(adapter);
      }

      if (sqlPackages[database] && adapter !== 'prisma') {
        this.dependencies.push(sqlPackages[database]);
      }

      if (adapter === 'sequelize') {
        return connectionString;
      }
      
      if (adapter === 'prisma' && database === 'sqlite') {
        return `file:./${connectionString.substr(9)}`;
      } else if (adapter === 'prisma') {
        return connectionString;
      }

      return {
        client: sqlPackages[database],
        connection: (database === 'sqlite' && typeof connectionString === 'string') ? {
          filename: connectionString.substring(9, connectionString.length)
        } : connectionString
      };

    case 'cassandra':
      if (typeof connectionString !== 'string') {
        return connectionString;
      }

      parsed = url.parse(connectionString);

      return {
        clientOptions: {
          contactPoints: [parsed.hostname],
          protocolOptions: { port: Number(parsed.port) || 9042 },
          keyspace: parsed.path.substring(1, parsed.path.length),
          queryOptions: { consistency: 1 }
        },
        ormOptions: {
          defaultReplicationStrategy: {
            class: 'SimpleStrategy',
            replication_factor: 1
          },
          migration: 'alter',
          createKeyspace: true
        }
      };

    case 'couchbase':
      this.dependencies.push(adapter);

      return {
        host: connectionString,
        options: {
          username: 'Administrator',
          password: 'supersecret'
        }
      };

    default:
      throw new Error(`Invalid database '${database}'. Cannot assemble configuration.`);
    }
  }

  _writeConfiguration () {
    const { database } = this.props;
    const config = Object.assign({}, this.defaultConfig);
    const configuration = this._getConfiguration();

    if (!config[database]) {
      config[database] = configuration;

      this.conflicter.force = true;
      this.fs.writeJSON(
        this.destinationPath(this.configDirectory, 'default.json'),
        config
      );
    }
  }

  prompting () {
    this.checkPackage();

    const databaseName = snakeCase(this.pkg.name);
    const { defaultConfig } = this;

    const getProps = answers => Object.assign({}, this.props, answers);
    const setProps = props => Object.assign(this.props, props);

    const prompts = [
      {
        type: 'list',
        name: 'database',
        message: 'Which database are you connecting to?',
        choices (current) {
          const answers = getProps(current);
          const { adapter } = answers;

          const defaultChoices = [
            { name: 'MySQL (MariaDB)', value: 'mysql' },
            { name: 'PostgreSQL', value: 'postgres' },
            { name: 'SQLite', value: 'sqlite' },
            { name: 'SQL Server', value: 'mssql' },
            { name: 'MongoDB', value: 'mongodb' },
            { name: 'Couchbase', value: 'couchbase' }
          ];

          if (adapter === 'prisma') {
            return defaultChoices.filter((db) => !['couchbase'].includes(db.value));
          }

          return defaultChoices;
        },
        when (current) {
          const answers = getProps(current);
          const { database, adapter } = answers;

          if (database) {
            return false;
          }

          switch (adapter) {
          case 'nedb':
          case 'memory':
          case 'mongodb':
          case 'cassandra':
          case 'couchbase':
            setProps({ database: adapter });
            return false;
          case 'mongoose':
            setProps({ database: 'mongodb' });
            return false;
          }

          return true;
        }
      },
      {
        type: 'list',
        name: 'adapter',
        message: 'Which database adapter would you like to use?',
        default (current) {
          const answers = getProps(current);
          const { database } = answers;

          if (database === 'mongodb') {
            return 'mongoose';
          }

          return 'sequelize';
        },
        choices (current) {
          const answers = getProps(current);
          const { database } = answers;
          const mongoOptions = [
            { name: 'MongoDB Native', value: 'mongodb' },
            { name: 'Mongoose', value: 'mongoose' }
          ];
          const sqlOptions = [
            { name: 'Sequelize', value: 'sequelize' },
            { name: 'KnexJS', value: 'knex' },
            { name: 'Objection', value: 'objection' },
            { name: 'Prisma', value: 'prisma' }
          ];
          const cassandraOptions = [
            { name: 'Cassandra', value: 'cassandra' }
          ];

          if (database === 'mongodb') {
            return mongoOptions;
          }

          if (database === 'cassandra') {
            return cassandraOptions;
          }

          // It's an SQL DB
          return sqlOptions;
        },
        when (current) {
          const answers = getProps(current);
          const { database, adapter } = answers;

          if (adapter) {
            return false;
          }

          switch (database) {
          case 'nedb':
          case 'memory':
          case 'cassandra':
          case 'couchbase':
            return false;
          }

          return true;
        }
      },
      {
        name: 'connectionString',
        message: 'What is the database connection string?',
        default (current) {
          const answers = getProps(current);
          const { database, adapter } = answers;
          const defaultConnectionStrings = {
            mongodb: `mongodb://localhost:27017/${databaseName}`,
            mysql: `mysql://root:@localhost:3306/${databaseName}`,
            nedb: 'nedb://../data',
            // oracle: `oracle://root:password@localhost:1521/${databaseName}`,
            postgres: `postgres://postgres:@localhost:5432/${databaseName}`,
            sqlite: `sqlite://${databaseName}.sqlite`,
            mssql: `mssql://root:password@localhost:1433/${databaseName}`,
            cassandra: `cassandra://localhost:9042/${databaseName}`,
            couchbase: 'couchbase://localhost'
          };

          if (adapter === 'prisma' && database === 'sqlite') {
            return `file:./${databaseName}.db`;
          }

          return defaultConnectionStrings[database];
        },
        when (current) {
          const answers = getProps(current);
          const { database } = answers;
          const connection = defaultConfig[database];

          if (connection) {
            if (connection.connection){
              setProps({ connectionString:connection.connection });
            } else {
              setProps({ connectionString:connection });
            }
            return false;
          }

          return database !== 'memory';
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing () {
    const { adapter } = this.props;
    const context = Object.assign({}, this.props);
    
    let template;

    if (adapter && adapter !== 'nedb') {
      template = `${adapter}`;
    }

    if (template) {
      const templateExists = this.fs.exists(this.srcDestinationPath(this.libDirectory, adapter));

      // If the file doesn't exist yet, add it to the app.js
      if (!templateExists) {
        const appjs = this.srcDestinationPath(this.libDirectory, 'app');

        this.conflicter.force = true;

        if (this.isTypescript) {
          this.fs.write(appjs, this._transformCodeTs(
            this.fs.read(appjs).toString()
          ));
          this._transformModuleDeclarations();
        } else {
          this.fs.write(appjs, this._transformCode(
            this.fs.read(appjs).toString()
          ));
        }
      }

      // Copy template only if connection generate is not composed
      // from the service generator
      if(!templateExists || (templateExists && !this.props.service)) {
        this.fs.copyTpl(
          this.srcTemplatePath(template),
          this.srcDestinationPath(this.libDirectory, adapter),
          context
        );
      }
    }

    this._writeConfiguration();

    this._packagerInstall(this.dependencies, {
      save: true
    });

    this._packagerInstall(this.devDependencies, {
      saveDev: true
    });
  }

  end () {
    const { database, adapter, connectionString } = this.props;

    if (adapter === 'prisma') {
      const providers = {
        mssql: 'sqlserver',
        postgres: 'postgresql',
      };
      this.log(`Run 'npx prisma init --datasource-provider ${providers[database] || database} --url ${connectionString}' in your command line!`);
    }

    // NOTE (EK): If this is the first time we set this up
    // show this nice message.
    if (connectionString && !this.defaultConfig[database]) {
      this.log();

      switch (database) {
      case 'mongodb':
      case 'mssql':
      case 'mysql':
      // case 'oracle':
      case 'postgres': // eslint-disable-line no-fallthrough
      case 'cassandra':
      case 'couchbase':
        this.log(`Make sure that your ${database} database is running, the username/role is correct, and "${connectionString}" is reachable and the database has been created.`);
        this.log('Your configuration can be found in the projects config/ folder.');
        break;
      }
    }
  }
};
