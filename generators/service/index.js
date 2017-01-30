'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Generator = require('../../lib/generator');
const j = require('../../lib/transform');

const templatePath = path.join(__dirname, 'templates');
const stripSlashes = name => name.replace(/^(\/*)|(\/*)$/g, '');
const createExpression = (object, property, args = []) =>
      j.expressionStatement(j.callExpression(j.memberExpression(j.identifier(object), j.identifier(property)), args));

module.exports = class ServiceGenerator extends Generator {
  prompting() {
    const prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'What kind of service would you like to create?',
        default: 'nedb',
        choices: [
          {
            name: 'A custom service',
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
        message: 'What is the name of the service?',
        validate(input) {
          if(input.trim() === '') {
            return 'Service name can not be empty';
          }

          return true;
        }
      }, {
        name: 'path',
        message: 'Which path should the service be registered on?',
        default(answers) {
          return `/${_.kebabCase(answers.name)}`;
        },
        validate(input) {
          if(input.trim() === '') {
            return 'Service path can not be empty';
          }

          return true;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      const { name } = props;
      
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
      throw new Error(`${this.libDirectory}/services/index.js seems to have more than one function declaration and we can not register the new service. Did you modify it?`);
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
      rethinkdb: 'feathers-rethinkdb'
    };
    const serviceModule = moduleMappings[type];
    const mainFile = this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.service.js`);
    const hasModel = fs.existsSync(path.join(templatePath, 'model', `${type}.js`));
    const context = Object.assign({}, this.props, {
      modelName: hasModel ? `${kebabName}.model` : null,
      path: stripSlashes(this.props.path),
      serviceModule
    });

    // Do not run code transformations if the service file already exists
    if(!this.fs.exists(mainFile)) {
      const servicejs = this.destinationPath(this.libDirectory, 'services', 'index.js');
      const transformed = this._transformCode(
        this.fs.read(servicejs).toString()
      );

      this.conflicter.force = true;
      this.fs.write(servicejs, transformed);
    }

    // Run the `connection` generator for the selected database
    // It will not do anything if the db has been set up already
    if(type !== 'generic' && type !== 'memory') {
      this.composeWith(require.resolve('../connection'), {
        props: { type }
      });
    } else if(type === 'generic') {
      // Copy the generic service class
      this.fs.copyTpl(
        this.templatePath('class.js'),
        this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.class.js`),
        context
      );
    }

    if(context.modelName) {
      // Copy the model
      this.fs.copyTpl(
        this.templatePath('model', `${type}.js`),
        this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.model.js`),
        context
      );
    }

    this.fs.copyTpl(
      this.templatePath('hooks.js'),
      this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.hooks.js`),
      context
    );

    this.fs.copyTpl(
      this.templatePath('filters.js'),
      this.destinationPath(this.libDirectory, 'services', kebabName, `${kebabName}.filters.js`),
      context
    );

    if(fs.existsSync(path.join(templatePath, 'types', `${type}.js`))) {
      this.fs.copyTpl(
        this.templatePath('types', `${type}.js`),
        mainFile,
        context
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('service.js'),
        mainFile,
        context
      );
    }

    if(serviceModule.charAt(0) !== '.') {
      this._packagerInstall([ serviceModule ], { save: true });
    }
  }
};
