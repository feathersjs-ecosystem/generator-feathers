'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var _ = require('lodash');

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop()
    };
  },

  prompting: function () {
    var done = this.async();
    var prompts = [{
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
      message: 'What providers should your API support?',
      choices: [{
        name: 'REST',
        checked: true
      }, {
        name: 'Socket.io',
        checked: true
      }, {
        name: 'Primus'
      }]
    }, {
      type: 'list',
      name: 'database',
      message: 'What database do you primarily want to use?',
      choices: [{
        name: 'I will choose my own',
        checked: true
      }, {
        name: 'memory'
      }, {
        name: 'mongodb'
      }, {
        name: 'mongoose'
      }, {
        name: 'nedb'
      }, {
        name: 'mysql'
      }, {
        name: 'postgresql'
      }, {
        name: 'sqlite'
      }]
    }, {
      type: 'checkbox',
      name: 'authentication',
      message: 'What authentication methods would you like to support?',
      choices: [{
        name: 'basic'
      }, {
        name: 'local'
      }, {
        name: 'google'
      }, {
        name: 'facebook'
      }, {
        name: 'twitter'
      }, {
        name: 'github'
      }]
    }];

    this.prompt(prompts, function (props) {
      this.props = _.extend(this.props, props);
      this.config.set('database', this.props.database);

      done();
    }.bind(this));
  },

  writing: function () {
    var dependencies = [
      'feathers',
      'feathers-hooks',
      'feathers-authentication',
      'feathers-configuration',
      'babel-core',
      'babel-preset-es2015'
    ];

    if(this.props.providers.indexOf('REST') !== -1) {
      dependencies.push('body-parser');
    }

    this.fs.copy(this.templatePath('static'), this.destinationPath());
    this.fs.copy(this.templatePath('static/.*'), this.destinationPath());

    this.fs.copyTpl(
      this.templatePath('app.js'),
      this.destinationPath('src', 'app.js'),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      this.props
    );

    this.npmInstall(dependencies, { save: true });

    this.npmInstall([
      'jshint',
      'mocha',
      'request'
    ], { saveDev: true});
  }
});
