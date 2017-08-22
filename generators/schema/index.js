const _ = require('lodash');
const Generator = require('../../lib/generator');
const j = require('../../lib/transform');

module.exports = class SchemaGenerator extends Generator {
  prompting() {
    this.checkPackage();

    const prompts = [{
      name: 'service',
      message: 'What is the name of the service?',
      validate(input) {
        if (input.trim() === '') {
          return 'Service name can not be empty';
        }

        return true;
      }
    }];
    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: _.kebabCase(props.service),
        snakeName: _.snakeCase(props.service)
      });
    });
  }

  _transformCode(code) {
    const ast = j(code);
    const moduleExports = ast.find(j.ExpressionStatement);

    if (moduleExports.length === 0) {
      throw new Error('Count not find module.exports.');
    }

    moduleExports.insertBefore(`const ${this.props.snakeName}Schema = require(\'./${this.props.kebabName}.schema\');`);
    ast.insertHookAsIs('before', 'create', `...${this.props.snakeName}Schema.hooks`);
    ast.insertHookAsIs('before', 'update', `...${this.props.snakeName}Schema.hooks`);
    ast.insertHookAsIs('before', 'patch', `...${this.props.snakeName}Schema.hooks`);

    return ast.toSource();
  }

  writing() {
    const dependencies = [
      'feathers-schema'
    ];

    const hooksjs = this.destinationPath(this.libDirectory, 'services', this.props.kebabName, `${this.props.kebabName}.hooks.js`);

    if (this.fs.exists(hooksjs)) {
      this.fs.write(hooksjs, this._transformCode(
        this.fs.read(hooksjs).toString()
      ));
    }

    this.fs.copyTpl(
      this.templatePath('template.schema.js'),
      this.destinationPath(this.libDirectory, 'services', this.props.kebabName, `${this.props.kebabName}.schema.js`),
      this.props
    );

    this._packagerInstall(dependencies, {
      save: true
    });
  }
};
