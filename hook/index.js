'use strict';

var generators = require('yeoman-generator');
var path = require('path');

module.exports = generators.Base.extend({
  initializing: function () {
    this.props = {
      name: process.cwd().split(path.sep).pop()
    };
  },

  prompting: function () {
    var done = this.async();
    var prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'What type of hook do you need?',
        choices: [
          {
            name: 'before hook',
            value: 'before',
            checked: true
          },
          {
            name: 'after hook',
            value: 'after',
            checked: true
          }
        ]
      },
      {
        name: 'name',
        message: 'What do you want to call your hook?',
      }
    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    this.fs.copyTpl(
      this.templatePath(this.props.type + '-hook.js'),
      this.destinationPath('server/hooks', this.props.name + '.js'),
      this.props
    );
    
    this.log(this.props);
  }
});

