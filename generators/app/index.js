'use strict';

const Generator = require('yeoman-generator');
const path = require('path');
const makeConfig = require('./configs');
const PROVIDERS = ['rest', 'socketio', 'primus'];

module.exports = class AppGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description
    };

    this.dependencies = [
      'feathers',
      'feathers-hooks',
      'feathers-errors',
      'feathers-configuration',
      'feathers-authentication',
      'serve-favicon',
      'compression',
      'body-parser',
      'cors'
    ];

    this.devDependencies = [
      'jshint',
      'mocha',
      'request'
    ];
  }

  prompting() {
    const prompts = [{
      name: 'name',
      message: 'Project name',
      when: !this.pkg.name,
      default: this.props.name
    }, {
      name: 'description',
      message: 'Description',
      when: !this.pkg.description
    }, {
      type: 'checkbox',
      name: 'providers',
      message: 'What type of API are you making?',
      choices: [{
        name: 'REST',
        value: 'rest',
        checked: true
      }, {
        name: 'Realtime via Socket.io',
        value: 'socketio',
        checked: true
      }, {
        name: 'Realtime via Primus',
        value: 'primus',
      }]
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing() {
    const props = this.props;
    const context = Object.assign({}, props, {
      hasProvider(name) {
        return props.providers.indexOf(name) !== -1;
      }
    });

    this.fs.copy(this.templatePath('static'), this.destinationPath());
    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());
    this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('', '.gitignore'));

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('', 'README.md'),
      context
    );

    this.fs.copyTpl(
      this.templatePath('app.js'),
      this.destinationPath('src', 'app.js'),
      context
    );

    this.fs.writeJSON(
      this.destinationPath('package.json'),
      makeConfig.package(this)
    );

    this.fs.writeJSON(
      this.destinationPath('config', 'default.json'),
      makeConfig.configDefault(this)
    );

    this.fs.writeJSON(
      this.destinationPath('config', 'production.json'),
      makeConfig.configProduction(this)
    );
  }

  install() {
    // Install providers like `feathers-rest` or `feathers-socketio`
    PROVIDERS.forEach(provider => {
      if(this.props.providers.indexOf(provider) !== -1) {
        this.dependencies.push(`feathers-${provider}`);
      }
    });

    this.npmInstall(this.dependencies, {
      save: true
    });
    
    this.npmInstall(this.devDependencies, {
      saveDev: true
    });
  }
};
