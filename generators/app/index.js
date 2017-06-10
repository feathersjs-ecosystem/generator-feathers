const Generator = require('../../lib/generator');
const path = require('path');
const makeConfig = require('./configs');
const cmd = require('child_process').execSync;

var yarnInstalled;
try {
  cmd('yarn bin').toString();
  yarnInstalled = true;
} catch (err) {
  yarnInstalled = false;
}

module.exports = class AppGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.props = {
      name: this.pkg.name || process.cwd().split(path.sep).pop(),
      description: this.pkg.description,
      src: this.pkg.directories && this.pkg.directories.lib
    };

    this.dependencies = [
      'feathers',
      'feathers-hooks',
      'feathers-hooks-common',
      'feathers-errors',
      'feathers-configuration',
      'serve-favicon',
      'compression',
      'body-parser',
      'helmet',
      'winston',
      'cors'
    ];

    this.devDependencies = [
      'eslint',
      'mocha',
      'request',
      'request-promise'
    ];
  }

  prompting () {
    const dependencies = this.dependencies.concat(this.devDependencies)
      .concat(['feathers-rest', 'feathers-socketio', 'feathers-primus']);
    const prompts = [{
      name: 'name',
      message: 'Project name',
      when: !this.pkg.name,
      default: this.props.name,
      validate (input) {
        // The project name can not be the same as any of the dependencies
        // we are going to install
        const isSelfReferential = dependencies.some(dependency => {
          const separatorIndex = dependency.indexOf('@');
          const end = separatorIndex !== -1 ? separatorIndex : dependency.length;
          const dependencyName = dependency.substring(0, end);

          return dependencyName === input;
        });

        if (isSelfReferential) {
          return `Your project can not be named '${input}' because the '${input}' package will be installed as a project dependency.`;
        }

        return true;
      }
    }, {
      name: 'description',
      message: 'Description',
      when: !this.pkg.description
    }, {
      name: 'src',
      message: 'What folder should the source files live in?',
      default: 'src',
      when: !(this.pkg.directories && this.pkg.directories.lib)
    }, {
      name: 'packager',
      type: 'list',
      message: 'Which package manager are you using (has to be installed globally)?',
      default: yarnInstalled ? 'yarn@>= 0.18.0' : 'npm@>= 3.0.0',
      choices: [{
        name: 'npm',
        value: 'npm@>= 3.0.0'
      }, {
        name: 'Yarn',
        value: 'yarn@>= 0.18.0'
      }]
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
      }],
      validate (input) {
        if (input.indexOf('primus') !== -1 && input.indexOf('socketio') !== -1) {
          return 'You can only pick SocketIO or Primus, not both.';
        }

        return true;
      }
    }];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing () {
    const props = this.props;
    const pkg = this.pkg = makeConfig.package(this);
    const context = Object.assign({}, props, {
      hasProvider (name) {
        return props.providers.indexOf(name) !== -1;
      }
    });

    // Static content for the root folder (including dotfiles)
    this.fs.copy(this.templatePath('static'), this.destinationPath());
    this.fs.copy(this.templatePath('static', '.*'), this.destinationPath());
    // Static content for the directories.lib folder
    this.fs.copy(this.templatePath('src'), this.destinationPath(props.src));
    // This hack is necessary because NPM does not publish `.gitignore` files
    this.fs.copy(this.templatePath('_gitignore'), this.destinationPath('', '.gitignore'));

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('', 'README.md'),
      context
    );

    this.fs.copyTpl(
      this.templatePath('app.js'),
      this.destinationPath(props.src, 'app.js'),
      context
    );

    this.fs.copyTpl(
      this.templatePath('app.test.js'),
      this.destinationPath('test', this.libTestDirectory, 'app.test.js'),
      context
    );

    this.fs.writeJSON(
      this.destinationPath('package.json'),
      pkg
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

  install () {
    this.props.providers.forEach(
      provider => this.dependencies.push(`feathers-${provider}`)
    );

    this._packagerInstall(this.dependencies, {
      save: true
    });

    this._packagerInstall(this.devDependencies, {
      saveDev: true
    });
  }
};
