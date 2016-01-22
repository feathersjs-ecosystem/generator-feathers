'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var crypto = require('crypto');

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop()
    };
    this.dependencies = [
      'feathers@2.0.0-pre.2',
      'feathers-hooks@1.0.0-pre.2',
      'feathers-errors',
      'feathers-configuration',
      'serve-favicon',
      'compression',
      'winston',
      'babel-core',
      'babel-preset-es2015'
    ];
  },

  prompting: function () {
    var done = this.async();
    var prompts = [
      {
        name: 'name',
        message: 'Project name',
        when: !this.pkg.name,
        default: this.props.name
      },
      {
        name: 'description',
        message: 'Description',
        when: !this.pkg.description
      },
      {
        type: 'checkbox',
        name: 'providers',
        message: 'What type of API are you making?',
        choices: [
          {
            name: 'REST',
            value: 'rest',
            checked: true
          },
          {
            name: 'Realtime via Socket.io',
            value: 'socket.io',
            checked: true
          },
          {
            name: 'Realtime via Primus',
            value: 'primus',
          }
        ]
      }, 
      {
        type: 'list',
        name: 'cors',
        message: 'CORS configuration',
        choices: [
          {
            name: 'Enabled for all domains',
            value: 'enabled',
            checked: true
          },
          {
            name: 'Enabled for whitelisted domains',
            value: 'whitelisted'
          },
          {
            name: 'Disabled',
            value: false
          }
        ]
      }, 
      {
        type: 'input',
        name: 'corsWhitelist',
        message: 'Comma-separated domains for CORS whitelist. Include http(s)',
        when: function(props){
          return props.cors === 'whitelisted';
        }
      }, 
      {
        type: 'list',
        name: 'database',
        message: 'What database do you primarily want to use?',
        choices: [
          {
            name: 'I will choose my own',
            checked: true
          },
          {
            name: 'Memory',
            value: 'memory'
          },
          {
            name: 'MongoDB',
            value: 'mongodb'
          },
          {
            name: 'MySQL',
            value: 'mysql'
          },
          {
            name: 'MariaDB',
            value: 'mariadb'
          },
          {
            name: 'NeDB',
            value: 'nedb'
          },
          {
            name: 'PostgreSQL',
            value: 'postgres'
          },
          {
            name: 'SQLite',
            value: 'sqlite'
          },
          {
           name: 'SQL Server',
           value: 'mssql'
          }
        ]
      },
      {
        type: 'checkbox',
        name: 'authentication',
        message: 'What authentication methods would you like to support?',
        choices: [
          {
            name: 'local',
            checked: true
          }
        //   name: 'basic'
        // }, {
          
        // }, {
        //   name: 'google'
        // }, {
        //   name: 'facebook'
        // }, {
        //   name: 'twitter'
        // }, {
        //   name: 'github'
        ]
      }
    ];

    this.prompt(prompts, function (props) {
      this.props = Object.assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: {
    providers: function() {
      if (this.props.providers.indexOf('rest') !== -1) {
        this.dependencies.push('body-parser');
        this.dependencies.push('feathers-rest');
      }

      if (this.props.providers.indexOf('socket.io') !== -1) {
        this.dependencies.push('feathers-socketio');
      }

      if (this.props.providers.indexOf('primus') !== -1) {
        this.dependencies.push('feathers-primus');
        this.dependencies.push('sockjs');
      }
    },

    cors: function() {
      this.props.corsWhitelist = this.props.corsWhitelist && this.props.corsWhitelist.split(',');

      if (this.props.cors) {
        this.dependencies.push('cors');
      }
    },

    authentication: function() {
      this.props.secret = crypto.randomBytes(64).toString('base64');

      if (this.props.authentication.length) {
        this.dependencies.push('feathers-authentication');

        this.fs.copy(
          this.templatePath('hooks.auth.js'),
          this.destinationPath('server/hooks', 'auth.js')
        );
      }
    },

    databases: function() {
      switch(this.props.database) {
        case 'memory':
          this.dependencies.push('feathers-memory');
          break;
        case 'mongodb':
          this.dependencies.push('mongoose');
          this.dependencies.push('feathers-mongoose');
          break;
        case 'mysql':
        case 'mariadb':
          this.dependencies.push('mysql');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize');
          break;
        case 'nedb':
          this.dependencies.push('nedb');
          this.dependencies.push('feathers-nedb');
          break;
        case 'postgres':
          this.dependencies.push('pg');
          this.dependencies.push('pg-hstore');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize');
          break;
        case 'sqlite':
          this.dependencies.push('sqlite3');
          this.dependencies.push('fs-extra');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize');
          break;
        case 'mssql':
          this.dependencies.push('tedious');
          this.dependencies.push('sequelize');
          this.dependencies.push('feathers-sequelize');
          break;
      }
    },

    services: function() {
      if (this.props.database) {
        this.composeWith('feathers:service', {
          options: {
            type: 'database',
            database: this.props.database,
            name: 'user',
            hazVersions: true,
            version: 'v1'
          }
        });

        this.fs.copyTpl(
          this.templatePath('service.js'),
          this.destinationPath('server/services', 'index.js'),
          this.props
        );
      }
    },

    application: function() {
      this.fs.copy(this.templatePath('static'), this.destinationPath());
      this.fs.copy(this.templatePath('static/.*'), this.destinationPath());

      this.fs.copyTpl(
        this.templatePath('app.js'),
        this.destinationPath('server', 'app.js'),
        this.props
      );
    },

    middleware: function() {
      this.fs.copyTpl(
        this.templatePath('middleware.js'),
        this.destinationPath('server/middleware', 'index.js'),
        this.props
      );
    },

    config: function() {      
      this.fs.copyTpl(
        this.templatePath('config.default.json'),
        this.destinationPath('config', 'default.json'),
        this.props
      );
      
      this.fs.copyTpl(
        this.templatePath('config.production.json'),
        this.destinationPath('config', 'production.json'),
        this.props
      );
      
      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        this.props
      );
    },

    deps: function() {
      this.npmInstall(this.dependencies, { save: true });

      this.npmInstall([
        'jshint',
        'mocha',
        'request'
      ], { saveDev: true});
    }
  }
});
