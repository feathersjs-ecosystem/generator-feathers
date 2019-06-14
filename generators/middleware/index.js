const path = require('path');
const { kebabCase, camelCase } = require('lodash');
const j = require('@feathersjs/tools').transform;
const validate = require('validate-npm-package-name');
const Generator = require('../../lib/generator');

module.exports = class MiddlewareGenerator extends Generator {
  prompting () {
    this.checkPackage();

    const prompts = [
      {
        name: 'name',
        message: 'What is the name of the Express middleware?'
      },
      {
        name: 'path',
        message: 'What is the mount path?',
        default: '*'
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props, {
        kebabName: validate(props.name).validForNewPackages ? props.name : kebabCase(props.name),
        camelName: camelCase(props.name)
      });
    });
  }

  _transformCode (code) {
    const { props } = this;
    const ast = j(code);
    const mainExpression = ast.find(j.FunctionExpression)
      .closest(j.ExpressionStatement);

    if (mainExpression.length !== 1) {
      throw new Error(`${this.libDirectory}/middleware/index.js seems to have more than one function declaration and we can not register the new middleware. Did you modify it?`);
    }

    const middlewareRequire = `const ${props.camelName} = require('./${props.kebabName}');`;
    const middlewareCode = props.path === '*' ? `app.use(${props.camelName}());` : `app.use('${props.path}', ${props.camelName}());`;

    mainExpression.insertBefore(middlewareRequire);
    mainExpression.insertLastInFunction(middlewareCode);

    return ast.toSource();
  }

  _transformCodeTs (code) {
    const { props } = this;
    const ast = j(code);

    const middlewareImport = `import ${props.camelName} from './${props.kebabName}';`;
    const middlewareCode = props.path === '*' ? `app.use(${props.camelName}());` : `app.use('${props.path}', ${props.camelName}());`;

    const lastImport = ast.find(j.ImportDeclaration).at(-1).get();
    const newImport = j(middlewareImport).find(j.ImportDeclaration).get().node;
    lastImport.insertAfter(newImport);
    const blockStatement = ast.find(j.BlockStatement).get().node;
    const newCode = j(middlewareCode).find(j.ExpressionStatement).get().node;
    blockStatement.body.push(newCode);

    return ast.toSource();
  }

  writing () {
    const config = this.fs.readJSON(this.destinationPath('config', 'default.json'));
    if (config.ts) {
      this.sourceRoot(path.join(__dirname, 'templates-ts'));
    }
    const context = this.props;
    const mainFile = this.destinationPath(this.libDirectory, 'middleware', config.ts ? `${context.kebabName}.ts` : `${context.kebabName}.js`);

    // Do not run code transformations if the middleware file already exists
    if (!this.fs.exists(mainFile)) {
      if (config.ts) {
        const middlewarets = this.destinationPath(this.libDirectory, 'middleware', 'index.ts');
        const transformed = this._transformCodeTs(
          this.fs.read(middlewarets).toString()
        );

        this.conflicter.force = true;
        this.fs.write(middlewarets, transformed);
      } else {
        const middlewarejs = this.destinationPath(this.libDirectory, 'middleware', 'index.js');
        const transformed = this._transformCode(
          this.fs.read(middlewarejs).toString()
        );

        this.conflicter.force = true;
        this.fs.write(middlewarejs, transformed);
      }
    }

    this.fs.copyTpl(
      this.templatePath(config.ts ? 'middleware.ts' : 'middleware.js'),
      mainFile, context
    );
  }
};
