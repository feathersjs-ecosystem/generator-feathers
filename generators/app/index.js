'use strict';

var generators = require('yeoman-generator');
var path = require('path');
var crypto = require('crypto');

var AUTH_PROVIDERS = {
  'bitbucket': {
    strategy: 'BitbucketStrategy',
    passport: 'passport-bitbucket-oauth2',
    permissions: {
      scope: ['account']
    }
  },
  'dropbox': {
    strategy: 'DropboxStrategy',
    passport: 'passport-dropbox-oauth2',
    permissions: {
      scope: []
    }
  },
  'facebook': {
    strategy: 'FacebookStrategy',
    passport: 'passport-facebook',
    permissions: {
      scope: ['public_profile', 'email']
    }
  },
  'github': {
    strategy: 'GithubStrategy',
    passport: 'passport-github',
    permissions: {
      scope: []
    }
  },
  'google': {
    strategy: 'GoogleStrategy',
    passport: 'passport-google-oauth20',
    permissions: {
      scope: ['profile']
    }
  },
  'instagram': {
    strategy: 'InstragramStrategy',
    passport: 'passport-instagram',
    permissions: {
      scope: ['basic']
    }
  },
  'linkedin': {
    strategy: 'LinkedinStrategy',
    passport: 'passport-linkedin-oauth2',
    permissions: {
      scope: ['r_emailaddress', 'r_basicprofile']
    }
  },
  'local': {},
  'paypal': {
    strategy: 'PaypalStrategy',
    passport: 'passport-paypal-oauth',
    permissions: {
      scope: ['https://identity.x.com/xidentity/resources/profile/me']
    }
  },
  'spotify': {
    strategy: 'SpotifyStrategy',
    passport: 'passport-spotify',
    permissions: {
      scope: ['user-read-email', 'user-read-private']
    }
  }
};

module.exports = generators.Base.extend({
  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.props = {
      name: process.cwd().split(path.sep).pop()
    };
    this.dependencies = [
      'feathers@2.0.0-pre.4',
      'feathers-hooks',
      'feathers-errors',
      'feathers-configuration',
      'serve-favicon',
      'compression',
      'winston'
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
        default: 'nedb',
        choices: [
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
          },
          {
            name: 'I will choose my own',
            value: 'generic'
          },
        ]
      },
      {
        type: 'checkbox',
        name: 'authentication',
        message: 'What authentication providers would you like to support?',
        choices: [
          {
            name: 'local',
            checked: true,
            value: JSON.stringify({'local': AUTH_PROVIDERS['local']}, null, '  ')
          },
          {
            name: 'bitbucket',
            value: JSON.stringify({'bitbucket': AUTH_PROVIDERS['bitbucket']}, null, '  ')
          },
          {
            name: 'dropbox',
            value: JSON.stringify({'dropbox': AUTH_PROVIDERS['dropbox']}, null, '  ')
          },
          {
            name: 'facebook',
            value: JSON.stringify({'facebook': AUTH_PROVIDERS['facebook']}, null, '  ')
          },
          {
            name: 'github',
            value: JSON.stringify({'github': AUTH_PROVIDERS['github']}, null, '  ')
          },
          {
            name: 'google',
            value: JSON.stringify({'google': AUTH_PROVIDERS['google']}, null, '  ')
          },
          {
            name: 'instagram',
            value: JSON.stringify({'instagram': AUTH_PROVIDERS['instagram']}, null, '  ')
          },
          {
            name: 'linkedin',
            value: JSON.stringify({'linkedin': AUTH_PROVIDERS['linkedin']}, null, '  ')
          },
          {
            name: 'paypal',
            value: {
              'paypal': JSON.stringify(AUTH_PROVIDERS['paypal'], null, '  ')
            }
          },
          {
            name: 'spotify',
            value: {
              'spotify': JSON.stringify(AUTH_PROVIDERS['spotify'], null, '  ')
            }
          }
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

      console.log(this.props.authentication);

      if (Object.keys(this.props.authentication).length) {
        this.dependencies.push('feathers-authentication');
        this.dependencies.push('passport');

        // If we have more than just the 'local' strategy add passport
        // if (Object.keys(this.props.authentication).length > 1 || !this.props.authentication.local) {
          
        // }
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
      this.props.services = [];

      if (this.props.database) {
        // If auth is enabled also create a user service
        if (this.props.authentication.length) {
          this.props.services.push('user');

          this.composeWith('feathers:service', {
            options: {
              type: 'database',
              database: this.props.database,
              name: 'user',
              authentication: true
            }
          });
        }

        this.fs.copyTpl(
          this.templatePath('service.js'),
          this.destinationPath('src/services', 'index.js'),
          this.props
        );
      }
    },

    application: function() {
      this.fs.copy(this.templatePath('static'), this.destinationPath());
      this.fs.copy(this.templatePath('static/.*'), this.destinationPath());
      this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('', '.gitignore'));

      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('', 'README.md'),
        this.props
      );

      this.fs.copyTpl(
        this.templatePath('app.js'),
        this.destinationPath('src', 'app.js'),
        this.props
      );
    },

    middleware: function() {
      this.fs.copyTpl(
        this.templatePath('middleware.js'),
        this.destinationPath('src/middleware', 'index.js'),
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
  },

  end: function() {
    this.log('\nWoot! We\'ve created your "' + this.props.name + '" app!');

    switch(this.props.database) {
      case 'mongodb':
      case 'mssql':
      case 'mysql':
      case 'mariadb':
      case 'postgres':
        this.log('Make sure that your ' + this.props.database + ' database is running...');
        break;
    }

    this.log('To start your feathers server run `npm start`.');
  }
});
