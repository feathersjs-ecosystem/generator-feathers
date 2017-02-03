'use strict';

const j = require('../../lib/transform');

const Generator = require('../../lib/generator');
// const randomstring = require('randomstring');
// authentication: {
//   secret: randomstring.generate(),
//   strategies: []
// }

module.exports = class AuthGenerator extends Generator {
  prompting() {
    const prompts = [{
      type: 'checkbox',
      name: 'strategies',
      message: 'What authentication providers do you want to use (other PassportJS strategies not in this list can still be configured manually)?',
      default: 'providers',
      choices: [{
        name: 'Username + Password (Local)',
        value: 'local'
      }, {
        name: 'Google',
        value: 'google'
      }, {
        name: 'Facebook',
        value: 'facebook'
      }, {
        name: 'GitHub',
        value: 'facebook'
      }],
      when: !this.props.type
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  _transformCode(code) {
    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureHooks = ast.findConfigure('hooks');
    const requireCall = 'const authentication = require(\'./authentication\');';

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.js to insert database configuration. Did you modify app.js?');
    }

    if (configureHooks.length === 0) {
      throw new Error('Could not find .configure(hooks()) call in app.js after which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureHooks.insertAfter('app.configure(authentication());');

    return ast.toSource();
  }

  writing() {
    const context = Object.assign({
      providers: {}
    }, this.props);

    this.props.strategies.forEach(strategy => {
      context.providers[strategy] = true;
    });

    // If the file doesn't exist yet, add it to the app.js
    if (!this.fs.exists(this.destinationPath(this.libDirectory, 'authentication.js'))) {
      const appjs = this.destinationPath(this.libDirectory, 'app.js');

      this.conflicter.force = true;
      this.fs.write(appjs, this._transformCode(
        this.fs.read(appjs).toString()
      ));
    }

    this.fs.copyTpl(
      this.templatePath('authentication.js'),
      this.destinationPath(this.libDirectory, 'authentication.js'),
      context
    );
  }
};
