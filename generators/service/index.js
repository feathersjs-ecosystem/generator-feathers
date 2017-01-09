'use strict';

const Generator = require('yeoman-generator');
const _ = require('lodash');
const j = require('../../lib/transform');

const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');
const createExpression = (object, property, args = []) =>
      j.expressionStatement(j.callExpression(j.memberExpression(j.identifier(object), j.identifier(property)), args));

module.exports = class DatabaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.props = {};
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
  }

  prompting() {
    const prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'What kind of service would you like to create?',
        default: 'nedb',
        choices: [
          {
            name: 'Service class',
            value: 'generic'
          }, {
            name: 'In Memory',
            value: 'memory'
          }, {
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
        name: 'name',
        message: 'What is the name of the service?'
      }, {
        name: 'path',
        message: 'Which path should the service be registered on?',
        default(answers) {
          return `/${_.kebabCase(answers.name)}`;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      const { name } = props;

      if(!name) {
        throw new Error(`You have to provide a name for the service`);
      }

      this.props = Object.assign(this.props, props, {
        kebabName: _.kebabCase(name),
        camelName: _.camelCase(name)
      });
    });
  }

  _transformCode(code) {
    const { camelName, kebabName } = this.props;
    const ast = j(code);

    const serviceRequire = `const ${camelName} = require('./${kebabName}/${kebabName}.service.js');`;
    const mainExpression = ast.find(j.FunctionExpression)
      .closest(j.ExpressionStatement);

    if(mainExpression.length !== 1) {
      throw new Error(`src/services/index.js seems to have more than one function declaration and we can not register the new service. Did you modify it?`);
    }

    // Add require('./service')
    mainExpression.insertBefore(serviceRequire);
    // Add app.configure(service) to service/index.js
    mainExpression.find(j.BlockStatement)
      .forEach((node) => {
        const stmts = node.value.body;
        const newStmt = createExpression('app', 'configure', [j.identifier(camelName)]);
        stmts.push(newStmt);
      });

    return ast.toSource();
  }

  _generic(context) {
    const { kebabName } = this.props;

    this.fs.copyTpl(
      this.templatePath('class.js'),
      this.destinationPath('src', 'services', kebabName, `${kebabName}.class.js`),
      context
    );

    this.fs.copyTpl(
      this.templatePath('service.js'),
      this.destinationPath('src', 'services', kebabName, `${kebabName}.service.js`),
      context
    );
  }

  _nedb(context) {
    const { kebabName } = this.props;

    this.fs.copyTpl(
      this.templatePath('types', 'nedb.js'),
      this.destinationPath('src', 'services', kebabName, `${kebabName}.service.js`),
      context
    );
  }

  writing() {
    const { type, kebabName } = this.props;
    const moduleMappings = {
      generic: `./${kebabName}.class.js`,
      memory: 'feathers-memory',
      nedb: 'feathers-nedb',
      mongodb: 'feathers-mongodb',
      mongoose: 'feathers-mongoose',
      sequelize: 'feathers-sequelize',
      knex: 'feathers-knex',
      rethinkdb: 'feathers-sequelize'
    };
    const serviceModule = moduleMappings[type];
    const mainFile = this.destinationPath('src', 'services', kebabName, `${kebabName}.service.js`);
    const context = Object.assign({}, this.props, {
      modelName: null,
      path: stripSlashes(this.props.path),
      serviceModule
    });

    // Do not run code transformations if the file already exists
    let transformCode = !this.fs.exists(mainFile);

    if(type !== 'generic' && type !== 'memory') {
      this.composeWith(require.resolve('../connection'), { type });
    }

    this.fs.copyTpl(
      this.templatePath('hooks.js'),
      this.destinationPath('src', 'services', kebabName, `${kebabName}.hooks.js`),
      context
    );

    this.fs.copyTpl(
      this.templatePath('filters.js'),
      this.destinationPath('src', 'services', kebabName, `${kebabName}.filters.js`),
      context
    );

    // Special service type
    if(this[`_${type}`]) {
      this[`_${type}`](context);
    } else {
      // Standard service type
      this.fs.copyTpl(
        this.templatePath('service.js'),
        mainFile,
        context
      );
    }

    if(serviceModule.charAt(0) !== '.') {
      this.npmInstall([ serviceModule ], { save: true });
    }

    if(transformCode) {
      this.log('Adding the new service to `src/services/index.js`. You will be prompted to confirm overwriting that file.');
      
      const servicejs = this.destinationPath('src', 'services', 'index.js');
      const transformed = this._transformCode(
        this.fs.read(servicejs).toString()
      );

      this.fs.write(servicejs, transformed);
    }
  }
};
