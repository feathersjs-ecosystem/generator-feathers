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
    this.dotfiles = ['editorconfig', 'gitignore', 'jshintrc', 'npmignore', 'travis.yml'];
    this.files = [
      'package.json',
      'src/index.js',
      'test/index.test.js',
      'LICENSE',
      'README.md'
    ];
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
    this.dotfiles.forEach(function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath('.' + file),
        this.props
      );
    }.bind(this));

    this.files.forEach(function(file) {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(file),
        this.props
      );
    }.bind(this));

    this.npmInstall([
      'feathers',
      'feathers-hooks'
    ], { save: true });

    this.npmInstall([
      'babel',
      'jshint',
      'mocha'
    ], { saveDev: true});
  }
});
