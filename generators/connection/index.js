'use strict';

const { kebabCase } = require('lodash');
const Generator = require('../../lib/generator');
const j = require('../../lib/transform');

module.exports = class ConnectionGenerator extends Generator {
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
        name: 'nedb',
        message: 'Where should NeDB store the database files?',
        default: '../data/',
        when(current) {
          const answers = getProps(current);
          return answers.type === 'nedb' && !defaultConfig.nedb;
        }
      }
      // , {
      //   name: 'mongodb',
      //   message: 'What is the default MongoDB connection URL?',
      //   default: `mongodb://localhost:27017/${databaseName}`,
      //   when(current) {
      //     const answers = getProps(current);

      //     return (answers.type === 'mongodb' || answers.type === 'mongoose') && !defaultConfig.mongodb;
      //   }
      // }, {
      //   name: 'rethinkdb',
      //   message: 'What is the RethinkDB database name?',
      //   default: databaseName,
      //   when(current) {
      //     const answers = getProps(current);

      //     return answers.type === 'rethinkdb' && !defaultConfig.rethinkdb;
      //   }
      // }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writeConfiguration() {
    const { type } = this.props;
    const config = Object.assign({}, this.defaultConfig);

    if(type === 'nedb') {
      config.nedb = this.props.nedb || config.nedb;
    }
    // if(type === 'mongoose') {
    //   config.mongodb = this.props.mongodb;
    // } else if(type === 'knex') {
    //   // TODO
    // } else if(type === 'sequelize') {
    //   // TODO
    // } else if(type === 'rethinkdb') {
    //   config.rethinkdb = {
    //     db: this.props.rethinkdb
    //   };
    // } else if(this.props[type]) {
    //   config[type] = this.props[type];
    // }

    this.conflicter.force = true;
    this.fs.writeJSON(
      this.destinationPath('config', 'default.json'),
      config
    );
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

    this.writeConfiguration();

    this._packagerInstall(dependencies, {
      save: true
    });
  }
};
