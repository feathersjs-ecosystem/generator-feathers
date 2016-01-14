'use strict';

var generators = require('yeoman-generator');
var path = require('path');

module.exports = generators.Base.extend({
  initializing: function () {
    this.props = {
      // name: process.cwd().split(path.sep).pop(),
      version: 'v1'
    };
  },

  prompting: function () {
    var done = this.async();
    var prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'What type of service do you need?',
        store: true,
        choices: [
          {
            name: 'generic',
            value: 'generic',
            checked: true
          },
          {
            name: 'database',
            value: 'database'
          }
        ]
      },
      {
        name: 'name',
        message: 'What do you want to call your service?',
        default: this.props.name
      },
      {
        type: 'confirm',
        name: 'hazVersions',
        message: 'Do you have API versions?',
        store: true,
        default: true
      },
      {
        name: 'version',
        message: 'What API version do you want to use?',
        default: this.props.version,
        store: true,
        when: function(answers){
          return answers.hazVersions;
        }
      },

    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    // TODO (EK): Supporting generating the models and services
    // for certain database types.
    if (this.props.type === 'database') {
      this.props.type = 'mongoose';
    }
    else {
      this.npmInstall(['feathers-errors'], { save: true });
    }

    // TODO (EK): Automatically import the new service
    // into services/index.js and initialize it.
    
    // TODO (EK): Automatically generate a new model
    // based on the database type.

    this.fs.copyTpl(
      this.templatePath(this.props.type + '-service.js'),
      this.destinationPath('server/services', this.props.name + '.js'),
      this.props
    );
    
    this.log(this.props);
  }
});

