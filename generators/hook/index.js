const fs = require('fs');
const path = require('path');
const j = require('@feathersjs/tools').transform;
const {kebabCase, camelCase} = require('lodash');
const {kebabPath, camelPath, backOutOf} = require('../helpers/path-helpers');
const Generator = require('../../lib/generator');

module.exports = class HookGenerator extends Generator {
  _listDirectories(...args) {

    // Windows?
    const win32 = process.platform === 'win32';

    // Normalize \\ paths to / paths.
    function unixifyPath(filepath) {
      if (win32) {
        return filepath.replace(/\\/g, '/');
      } else {
        return filepath;
      }
    }

    // Recurse into a directory, executing callback for each file.
    function walk(rootdir, callback, subdir) {
      let abspath = subdir ? path.join(rootdir, subdir) : rootdir;
      fs.readdirSync(abspath).forEach(function (filename) {
        let filepath = path.join(abspath, filename);
        if (fs.lstatSync(filepath).isDirectory()) {
          walk(rootdir, callback, unixifyPath(path.join(subdir || '', filename || '')));
        } else {
          callback(unixifyPath(filepath), rootdir, subdir, filename);
        }
      });
    }

    const serviceDir = this.destinationPath(...args);
    const files = [];

    walk(serviceDir, (path, rootdir, subdir) => {
      if (/\.service\.js$/.test(path)) {
        files.push(subdir.split('/').join('.'));
      }
    });

    return files;
  }

  _transformHookFile(code, moduleName) {
    const {type, methods, camelName} = this.props;
    const hookRequire = `const ${camelName} = require('${moduleName}');`;

    const ast = j(code);
    const hookDefinitions = ast.find(j.ObjectExpression)
      .closest(j.ExpressionStatement);

    if (hookDefinitions.length !== 1) {
      throw new Error(`Could not find the hooks definition object while adding ${moduleName}`);
    }

    hookDefinitions.insertBefore(hookRequire);

    methods.forEach(method => {
      ast.insertHook(type, method, camelName);
    });

    return ast.toSource();
  }

  _addToService(serviceName, hookName) {
    let hooksFile = this.destinationPath(this.libDirectory, 'services', serviceName, `${serviceName}.hooks.js`);
    let moduleName = `../../${hookName}`;

    if (serviceName === '__app') {
      hooksFile = this.destinationPath(this.libDirectory, 'app.hooks.js');
      moduleName = `./${hookName}`;
    }

    if (!this.fs.exists(hooksFile)) {
      throw new Error(`Can not add hook to the ${serviceName} hooks file ${hooksFile}. It does not exist.`);
    }

    const transformed = this._transformHookFile(this.fs.read(hooksFile), moduleName);

    this.conflicter.force = true;
    this.fs.write(hooksFile, transformed);
  }

  prompting() {
    this.checkPackage();

    const services = this._listDirectories(this.libDirectory, 'services');
    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the hook?'
      }, {
        type: 'list',
        name: 'type',
        message: 'What kind of hook should it be?',
        choices: [
          {
            name: 'I will add it myself',
            value: null
          }, {
            value: 'before'
          }, {
            value: 'after'
          }, {
            value: 'error'
          }
        ]
      }, {
        type: 'checkbox',
        name: 'services',
        message: 'What service(s) should this hook be for (select none to add it yourself)?\n',
        choices() {
          return [{
            name: 'Application wide (all services)',
            value: '__app'
          }].concat(services.map(value => ({value})));
        },
        when(answers) {
          return answers.type !== null;
        }
      }, {
        type: 'checkbox',
        name: 'methods',
        message: 'What methods should the hook be for (select none to add it yourself)?',
        choices: [
          {
            value: 'all'
          }, {
            value: 'find'
          }, {
            value: 'get'
          }, {
            value: 'create'
          }, {
            value: 'update'
          }, {
            value: 'patch'
          }, {
            value: 'remove'
          }
        ],
        when(answers) {
          return answers.type !== null && answers.services.length;
        },
        validate(methods) {
          if (methods.indexOf('all') !== -1 && methods.length !== 1) {
            return 'Select applicable methods or \'all\', not both.';
          }

          return true;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: kebabCase(props.name),
        kebabPath: kebabPath(props.name),
        camelName: camelCase(props.name),
        camelPath: camelPath(props.name),
      });
    });
  }

  writing() {
    const context = Object.assign({
      libDirectory: this.libDirectory
    }, this.props);
    const mainFile = this.destinationPath(this.libDirectory, 'hooks', `${context.kebabPath}.js`);

    if (!this.fs.exists(mainFile) && context.type) {
      this.props.services.forEach(serviceName =>
        this._addToService(serviceName, `hooks/${context.kebabName}`)
      );
    }

    this.fs.copyTpl(
      this.templatePath(this.hasAsync ? 'hook-async.js' : 'hook.js'),
      mainFile, context
    );

    this.fs.copyTpl(
      this.templatePath(this.hasAsync ? 'test-async.js' : 'test.js'),
      context.kebabPath.split('/').length === 1 ? this.destinationPath(this.testDirectory, 'hooks', `${context.kebabName}.test.js`) : this.destinationPath(this.testDirectory, 'hooks', context.kebabPath, `${context.kebabName}.test.js`),
      Object.assign({}, context, {appDir: context.kebabPath.split('/').length === 1 ? backOutOf(this.testDirectory, 'hooks') : backOutOf(this.testDirectory, 'hooks', context.kebabPath)})
    );
  }
};
