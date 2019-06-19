const _ = require('lodash');
const j = require('@feathersjs/tools').transform;
const crypto = require('crypto');
const validate = require('validate-npm-package-name');

const Generator = require('../../lib/generator');
const OAUTH2_STRATEGY_MAPPINGS = {
  auth0: 'passport-auth0',
  google: 'passport-google-oauth20',
  facebook: 'passport-facebook',
  github: 'passport-github'
};

module.exports = class AuthGenerator extends Generator {
  prompting() {
    this.checkPackage();

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use? Other PassportJS strategies not in this list can still be configured manually.',
      default: 'providers',
      choices: [{
        name: 'Username + Password (Local)',
        value: 'local',
        checked: true
      }, {
        name: 'Auth0',
        value: 'auth0'
      }, {
        name: 'Google',
        value: 'google'
      }, {
        name: 'Facebook',
        value: 'facebook'
      }, {
        name: 'GitHub',
        value: 'github'
      }]
    }, {
      name: 'entity',
      message: 'What is the name of the user (entity) service?',
      default: 'users'
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  _transformCode(code) {
    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureServices = ast.findConfigure('services');
    const requireCall = 'const authentication = require(\'./authentication\');';

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.js to insert database configuration. Did you modify app.js?');
    }

    if (configureServices.length === 0) {
      throw new Error('Could not find .configure(services) call in app.js after which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureServices.insertBefore('app.configure(authentication);');

    return ast.toSource();
  }

  _transformCodeTs(code) {
    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureServices = ast.findConfigure('services');
    const requireCall = 'import authentication from \'./authentication\';';

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.ts to insert database configuration. Did you modify app.ts?');
    }

    if (configureServices.length === 0) {
      throw new Error('Could not find .configure(services) call in app.ts after which to insert database configuration. Did you modify app.ts?');
    }

    appDeclaration.insertBefore(requireCall);
    configureServices.insertBefore('app.configure(authentication);');

    return ast.toSource();
  }

  _writeConfiguration() {
    const config = Object.assign({}, this.defaultConfig);

    config.authentication = {
      'entity': 'user',
      'service': 'users',
      'secret': crypto.randomBytes(20).toString('base64'),
      'authStrategies': ['jwt', 'local'],
      'jwtOptions': {
        'header': { 'typ': 'access' },
        'audience': 'https://yourdomain.com',
        'issuer': 'feathers',
        'algorithm': 'HS256',
        'expiresIn': '1d'
      },
      'local': {
        'usernameField': 'email',
        'passwordField': 'password'
      }
    };

    this.conflicter.force = true;
    this.fs.writeJSON(
      this.destinationPath(this.configDirectory, 'default.json'),
      config
    );
  }

  writing() {
    const dependencies = [
      '@feathersjs/authentication',
      '@feathersjs/authentication-local',
      '@feathersjs/authentication-oauth'
    ];
    const context = Object.assign({
      kebabEntity: validate(this.props.entity).validForNewPackages ? this.props.entity : _.kebabCase(this.props.entity),
      camelEntity: _.camelCase(this.props.entity),
      oauthProviders: []
    }, this.props);

    // Set up strategies and add dependencies
    this.props.strategies.forEach(strategy => {
      const oauthProvider = OAUTH2_STRATEGY_MAPPINGS[strategy];

      if (oauthProvider) {
        dependencies.push('@feathersjs/authentication-oauth2');
        dependencies.push(oauthProvider);
        context.oauthProviders.push({
          name: strategy,
          strategyName: `${_.upperFirst(strategy)}Strategy`,
          module: oauthProvider
        });
      } else {
        dependencies.push(`@feathersjs/authentication-${strategy}`);
      }
    });

    if(!this.fs.exists(this.srcDestinationPath(this.libDirectory, 'services', context.kebabEntity, `${context.kebabEntity}.service`))) {
      // Create the users service
      this.composeWith(require.resolve('../service'), {
        props: {
          name: context.entity,
          path: `/${context.kebabEntity}`,
          authentication: context
        }
      });
    }

    // If the file doesn't exist yet, add it to the app.js
    if (!this.fs.exists(this.srcDestinationPath(this.libDirectory, 'authentication'))) {
      const appjs = this.srcDestinationPath(this.libDirectory, 'app');

      this.conflicter.force = true;
      if (this.srcType === 'ts') {
        this.fs.write(appjs, this._transformCodeTs(
          this.fs.read(appjs).toString()
        ));
      } else {
        this.fs.write(appjs, this._transformCode(
          this.fs.read(appjs).toString()
        ));
      }
    }

    this.fs.copyTpl(
      this.srcTemplatePath('authentication'),
      this.srcDestinationPath(this.libDirectory, 'authentication'),
      context
    );

    this._writeConfiguration(context);
    this._packagerInstall(dependencies, {
      save: true
    });
    if (this.srcType === 'ts') {
      this._packagerInstall(['@types/jsonwebtoken'], { saveDev: true });
    }
  }
};
