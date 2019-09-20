const path = require('path');
const j = require('@feathersjs/tools').transform;
const { kebabCase, camelCase, last } = require('lodash');
const dir = require('node-dir');
const validate = require('validate-npm-package-name');
const Generator = require('../../lib/generator');

module.exports = class HookGenerator extends Generator {
  _listServices (...args) {
    const serviceDir = this.destinationPath(...args);
    const files = dir.files(serviceDir, { sync: true });
    const isTs = this.isTypescript;
    const services = files.filter(file => file.endsWith(isTs ? 'service.ts' : '.service.js'))
      .map(file => path.dirname(path.relative(serviceDir, file)));
    
    return services;
  }

  _transformHookFile (code, moduleName) {
    const { type, methods, camelName } = this.props;
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

  _transformHookFileTs (code, moduleName) {
    const { type, methods, camelName } = this.props;
    const hookImport = `import ${camelName} from '${moduleName}';`;

    const ast = j(code);
    const hookDefinitions = ast.find(j.ExportDefaultDeclaration);

    if (hookDefinitions.length !== 1) {
      throw new Error(`Could not find the hooks definition object while adding ${moduleName}`);
    }

    const imports = ast.find(j.ImportDeclaration);
    if (imports.length === 0) {
      const newImport = j(hookImport).find(j.ImportDeclaration).get().node;
      hookDefinitions.insertBefore(newImport);
    } else{
      const lastImport = ast.find(j.ImportDeclaration).at(-1).get();
      const newImport = j(hookImport).find(j.ImportDeclaration).get().node;
      lastImport.insertAfter(newImport);
    }

    methods.forEach(method => {
      ast.insertHook(type, method, camelName);
    });

    return ast.toSource();
  }

  _addToService (serviceName, hookName) {
    const nameParts = serviceName.split('/');
    const relativeRoot = '../'.repeat(nameParts.length + 1);

    let hooksFile = this.srcDestinationPath(this.libDirectory, 'services', ...nameParts, `${last(nameParts)}.hooks`);
    let moduleName = relativeRoot + hookName;

    if (serviceName === '__app') {
      hooksFile = this.srcDestinationPath(this.libDirectory, 'app.hooks');
      moduleName = `./${hookName}`;
    }

    if (!this.fs.exists(hooksFile)) {
      throw new Error(`Can not add hook to the ${serviceName} hooks file ${hooksFile}. It does not exist.`);
    }

    const transformed = this.isTypescript ? this._transformHookFileTs(this.fs.read(hooksFile), moduleName)
      : this._transformHookFile(this.fs.read(hooksFile), moduleName);

    this.conflicter.force = true;
    this.fs.write(hooksFile, transformed);
  }

  prompting () {
    this.checkPackage();

    const services = this._listServices(this.libDirectory, 'services');
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
        choices () {
          return [{
            name: 'Application wide (all services)',
            value: '__app'
          }].concat(services.map(value => ({ value })));
        },
        when (answers) {
          return answers.type !== null;
        },
        validate(answers) {
          if (answers.length < 1) {
            return 'You have to select at least one service (use Space key to select).';
          }

          return true;
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
        when (answers) {
          return answers.type !== null && answers.services.length;
        },
        validate (methods) {
          if (methods.length < 1) {
            return 'You have to select at least one method (use Space key to select).';
          }

          if (methods.indexOf('all') !== -1 && methods.length !== 1) {
            return 'Select applicable methods or \'all\', not both.';
          }

          return true;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: validate(props.name).validForNewPackages ? props.name : kebabCase(props.name),
        camelName: camelCase(props.name)
      });
    });
  }

  writing () {
    const context = Object.assign({
      libDirectory: this.libDirectory
    }, this.props);
    const mainFile = this.srcDestinationPath(this.libDirectory, 'hooks', context.kebabName);

    if (!this.fs.exists(mainFile) && context.type) {
      this.props.services.forEach(serviceName =>
        this._addToService(serviceName, `hooks/${context.kebabName}`)
      );
    }

    this.fs.copyTpl(
      this.srcTemplatePath('hook'),
      mainFile, context
    );
  }
};
