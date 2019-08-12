const _ = require('lodash');
const j = require('@feathersjs/tools').transform;
const crypto = require('crypto');
const validate = require('validate-npm-package-name');

const Generator = require('../../lib/generator');

module.exports = class AuthGenerator extends Generator {
  prompting() {
    this.checkPackage();

    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication strategies do you want to use? (See API docs for all 180+ supported oAuth providers)',
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
        name: 'Twitter',
        value: 'twitter'
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
      this.props.oauthProviders = this.props.strategies.filter(s => s !== 'local');
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

    const authentication = {
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

    for (let strategy of this.props.oauthProviders) {
      authentication.oauth = authentication.oauth || {
        redirect: '/'
      };
      authentication.oauth[strategy] = {
        key: `<${strategy} oauth key>`,
        secret: `<${strategy} oauth secret>`
      };
    }

    config.authentication = authentication;
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
      libDirectory: this.libDirectory
    }, this.props);

    if(!this.fs.exists(this.srcDestinationPath(this.libDirectory, 'services', context.kebabEntity, `${context.kebabEntity}.service`))) {
      // Create the users service
      this.composeWith(require.resolve('../service'), {
        props: {
          tester: context.tester,
          name: context.entity,
          path: `/${context.kebabEntity}`,
          authentication: context
        }
      });
    }

    // If the file doesn't exist yet, add it to the app.js
    if (!this.fs.exists(this.srcDestinationPath(this.libDirectory, 'authentication'))) {
      const appSrc = this.srcDestinationPath(this.libDirectory, 'app');

      this.conflicter.force = true;
      const code = this.fs.read(appSrc).toString();
      let transformed;
      if (this.srcType === 'ts') {
        transformed = this._transformCodeTs(code);
      } else {
        transformed = this._transformCode(code);
      }
      this.fs.write(appSrc, transformed);
    }

    this.fs.copyTpl(
      this.srcTemplatePath('authentication'),
      this.srcDestinationPath(this.libDirectory, 'authentication'),
      context
    );

    this.fs.copyTpl(
      this.srcTemplatePath(`test.${this.testLibrary}`),
      this.srcDestinationPath(this.testDirectory, 'authentication.test'),
      context
    );

    this._writeConfiguration(context);
    this._packagerInstall(dependencies, {
      save: true
    });
    if (this.srcType === 'ts') {
      this._packagerInstall(['@types/jsonwebtoken'], { saveDev: true });
    }

    // Updating app.interface.ts
    if (this.srcType === 'ts') {
      const appInterfaceFile = this.srcDestinationPath(this.libDirectory, 'app.interface');
      const code = this.fs.read(appInterfaceFile).toString();
      const ast = j(code);

      const importCode = 'import { AuthenticationService } from \'@feathersjs/authentication\';';
      const serviceTypeCode = '\'authentication\': AuthenticationService';

      const lastImport = ast.find(j.ImportDeclaration).at(-1).get();
      const newImport = j(importCode).find(j.ImportDeclaration).get().node;
      lastImport.insertAfter(newImport);

      const firstExport = ast.find(j.ExportNamedDeclaration).at(0);
      const interfaceDeclaration = firstExport.find(j.Declaration).get().node;
      const newServiceType = j(serviceTypeCode).nodes()[0];
      interfaceDeclaration.body.properties.push(newServiceType);

      this.fs.write(appInterfaceFile, ast.toSource());
    }
  }
};
