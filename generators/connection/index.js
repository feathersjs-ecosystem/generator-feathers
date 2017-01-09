'use strict';

const Generator = require('yeoman-generator');
const { kebabCase, isEqual } = require('lodash');
const j = require('../../lib/transform');

module.exports = class ConnectionGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.props = { type: opts.type };
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.defaultConfig = this.fs.readJSON(this.destinationPath('config', 'default.json'), {});
  }

  prompting() {
    const databaseName = kebabCase(this.pkg.name);
    const { defaultConfig } = this;
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
        ]
      }, {
        name: 'nedb',
        message: 'Where should NeDB store the database files?',
        default: '../data/',
        when(answers) {
          return answers.type === 'nedb' && !defaultConfig.nedb;
        }
      }, {
        name: 'mongodb',
        message: 'What is the default MongoDB connection URL?',
        default: `mongodb://localhost:27017/${databaseName}`,
        when(answers) {
          return (answers.type === 'mongodb' || answers.type === 'mongoose') && !defaultConfig.mongodb;
        }
      }, {
        name: 'rethinkdb',
        message: 'What is the RethinkDB database name?',
        default: databaseName,
        when(answers) {
          return answers.type === 'rethinkdb' && !defaultConfig.rethinkdb;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writeConfiguration() {
    const { type } = this.props;
    const config = Object.assign({}, this.defaultConfig);
      
    if(type === 'mongoose') {
      config.mongodb = this.props.mongodb;
    } else if(type === 'knex') {
      // TODO
    } else if(type === 'sequelize') {
      // TODO
    } else if(type === 'rethinkdb') {
      config.rethinkdb = {
        db: this.props.rethinkdb
      };
    } else {
      config[type] = this.props[type];
    }

    if(!isEqual(config, this.defaultConfig)) {
      this.fs.writeJSON(
        this.destinationPath('config', 'default.json'),
        config
      );
    }
  }

  _transformCode(code) {
    const { type } = this.props;
    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureAuth = ast.findConfigure('authentication');
    const requireCall = `const ${type} = require('./${type}');`;

    if(appDeclaration.length === 0) {
      throw new Error(`Could not find 'app' variable declaration in app.js to insert database configuration. Did you modify app.js?`);
    }

    if(configureAuth.length === 0) {
      throw new Error(`Could not find .configure(authentication) call in app.js before which to insert database configuration. Did you modify app.js?`);
    }

    appDeclaration.insertBefore(requireCall);
    configureAuth.insertBefore(`app.configure(${type});`);

    return ast.toSource();
  }

  writing() {
    const dependencyMappings = {
      nedb: [ 'nedb', 'feathers-nedb' ],
      mongodb: [ 'mongodb', 'feathers-mongodb' ],
      mongoose: [ 'mongoose', 'feathers-mongodb' ],
      rethinkdb: [ 'rethinkdbdash', 'feathers-rethinkdb' ],
      knex: [ 'knex', 'feathers-knex' ],
      sequelize: [ 'sequelize', 'feathers-sequelize' ]
    };
    const { type } = this.props;
    const dependencies = dependencyMappings[type];

    let transformCode = false;

    if(type !== 'nedb') {
      const dbFile = `${type}.js`;

      transformCode = !this.fs.exists(this.destinationPath('src', dbFile));
      this.fs.copy(this.templatePath(dbFile), this.destinationPath('src', dbFile));
    }

    this.writeConfiguration();

    if(transformCode) {
      this.log('Adding database configuration to `src/app.js`. You will be prompted to confirm overwriting that file.');

      const appjs = this.destinationPath('src', 'app.js');
      const transformed = this._transformCode(
        this.fs.read(appjs).toString()
      );

      this.fs.write(appjs, transformed);
    }

    this.npmInstall(dependencies, {
      save: true
    });
  }
};
