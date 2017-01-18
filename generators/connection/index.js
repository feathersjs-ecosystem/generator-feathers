'use strict';

const { kebabCase } = require('lodash');
const url = require('url');
const Generator = require('../../lib/generator');
const j = require('../../lib/transform');

const getConnectionType = type => {
  if(type === 'mongoose') {
    return 'mongodb';
  }

  if(type === 'knex' || type === 'sequelize') {
    return 'sqlite';
  }

  return type;
};

const getProtocol = p => p[p.length - 1] === ':' ? p.substring(0, p.length - 1) : p;

module.exports = class ConnectionGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.dependencies = [];
  }

  _transformCode(code) {
    const { type } = this.props;
    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureAuth = ast.findConfigure('authentication');
    const requireCall = `const ${type} = require('./${type}');`;

    if(appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.js to insert database configuration. Did you modify app.js?');
    }

    if(configureAuth.length === 0) {
      throw new Error('Could not find .configure(authentication) call in app.js before which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureAuth.insertBefore(`app.configure(${type});`);

    return ast.toSource();
  }

  _getConfiguration() {
    const sqlPackages = {
      postgres: 'pg',
      sqlite: 'sqlite3',
      mysql: 'mysql',
      mssql: 'tedious',
      oracle: 'oracle'
    };
    const { connectionString, type } = this.props;
    const parsed = url.parse(connectionString);
    const protocol = getProtocol(parsed.protocol);

    switch(type) {
    case 'nedb':
      this.dependencies.push('nedb');
      return connectionString.substring(7, connectionString.length);

    case 'rethinkdb':
      this.dependencies.push('rethinkdbdash');
      return {
        database: parsed.path.substring(1, parsed.path.length),
        servers: [
          {
            host: parsed.hostname,
            port: parsed.port
          }
        ]
      };

    case 'mongoose':
    case 'mongodb':
      this.dependencies.push(type);
      return connectionString;
    
    case 'sequelize':
      this.dependencies.push('sequelize');
      if(sqlPackages[protocol]) {
        this.dependencies.push(sqlPackages[protocol]);
      }
      return connectionString;
    case 'knex':
      this.dependencies.push('knex');
      if(sqlPackages[protocol]) {
        this.dependencies.push(sqlPackages[protocol]);
      }

      return {
        client: sqlPackages[protocol],
        connection: connectionString
      };

    default:
      throw new Error('Invalid database connection type to assemble configuration');
    }
  }
  
  _writeConfiguration() {
    const { type } = this.props;
    const config = Object.assign({}, this.defaultConfig);

    config[type] = config[type] || this._getConfiguration();

    this.conflicter.force = true;
    this.fs.writeJSON(
      this.destinationPath('config', 'default.json'),
      config
    );
  }

  prompting() {
    const databaseName = kebabCase(this.pkg.name);
    const { defaultConfig } = this;
    const getProps = answers => Object.assign({}, this.props, answers);
    
    const prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'Which database are you connecting to?',
        default: 'nedb',
        choices: [
          {
            name: 'NeDB',
            value: 'nedb'
          }, {
            name: 'MongoDB',
            value: 'mongodb'
          }, {
            name: 'Mongoose',
            value: 'mongoose'
          }, {
            name: 'Sequelize',
            value: 'sequelize'
          }, {
            name: 'KnexJS',
            value: 'knex'
          }, {
            name: 'RethinkDB',
            value: 'rethinkdb'
          }
        ],
        when: !this.props.type
      }, {
        name: 'connectionString',
        message: 'What is the database connection string (allowed protocols are nedb, mongodb, rethinkdb, postgres, sqlite, mssql, oracle)?',
        default(answers) {
          const type = getConnectionType(answers.type);
          const defaultConnectionStrings = {
            nedb: 'nedb://../data',
            mongodb: `mongodb://localhost:27017/${databaseName}`,
            sqlite: 'sqlite://data.sqlite',
            rethinkdb: `rethinkdb://localhost:11078/${databaseName}`
          };

          return defaultConnectionStrings[type];
        },
        when(current) {
          const answers = getProps(current);

          return !defaultConfig[answers.type];
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing() {
    const { type } = this.props;

    // NeDB does not need a separate db configuration file
    if(type !== 'nedb') {
      const dbFile = `${type}.js`;

      // If the file doesn't exist yet, add it to the app.js
      if(!this.fs.exists(this.destinationPath('src', dbFile))) {
        const appjs = this.destinationPath(this.libDirectory, 'app.js');

        this.conflicter.force = true;
        this.fs.write(appjs, this._transformCode(
          this.fs.read(appjs).toString()
        ));
      }

      this.fs.copy(this.templatePath(dbFile), this.destinationPath(this.libDirectory, dbFile));
    }

    this._writeConfiguration();

    this._packagerInstall(this.dependencies, {
      save: true
    });
  }
};
