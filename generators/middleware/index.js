const generators = require('yeoman-generator');
const fs = require('fs');
const assign = require('object.assign').getPolyfill();
const inflect = require('i')();
const updateMixin = require('../../lib/updateMixin');
const transform = require('../../lib/transform');

function importMiddleware(filename, name, moduleName) {
  // Lookup existing service/index.js file
  if (fs.existsSync(filename)) {
    const content = fs.readFileSync(filename).toString();
    const ast = transform.parse(content);

    transform.addImport(ast, name, moduleName);

    fs.writeFileSync(filename, transform.print(ast));
  }
}

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments);
    updateMixin.extend(this);
  },

  initializing: function (name) {
    const done = this.async();
    this.props = { name: name };

    this.props = assign(this.props, this.options);
    this.mixins.notifyUpdate(done);
  },

  prompting: function () {
    const done = this.async();
    const options = this.options;
    const prompts = [
      {
        name: 'name',
        message: 'What do you want to call your middleware?',
        default: this.props.name,
        when: function(){
          return options.name === undefined;
        },
      }
    ];

    this.prompt(prompts).then(function (props) {
      this.props = assign(this.props, props);

      done();
    }.bind(this));
  },

  writing: function () {
    this.props.codeName = inflect.camelize(inflect.underscore(this.props.name), false);

    const middlewareIndexPath = this.destinationPath('src/middleware/index.js');

    this.fs.copyTpl(
      this.templatePath('middleware.js'),
      this.destinationPath('src/middleware', this.props.name + '.js'),
      this.props
    );

    // Automatically import the new service into services/index.js and initialize it.
    importMiddleware(middlewareIndexPath, this.props.codeName, './' + this.props.name);
  }
});
