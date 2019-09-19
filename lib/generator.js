const path = require('path');
const Generator = require('yeoman-generator');
const semver = require('semver');
const _ = require('lodash');
const debug = require('debug')('generator-feathers');

module.exports = class BaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.generatorPkg = this.fs.readJSON(path.join(__dirname, '..', 'package.json'));
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    this.defaultConfig = this.fs.readJSON(this.destinationPath(this.configDirectory, 'default.json'), {});
    this.props = opts.props || {};

    if (!semver.satisfies(process.version, '>= 8.0.0')) {
      this.log.error('The generator will only work with Node v8.0.0 and up!');
      process.exit();
    }

    if(this.pkg.dependencies && this.pkg.dependencies.feathers) {
      this.log.error('This version of the generator will only work with Feathers Buzzard (v3) and up. Please run `feathers upgrade` first.');
      process.exit();
    }
  }

  checkPackage() {
    if(_.isEmpty(this.pkg)) {
      this.log.error('Could not find a valid package.json. Did you generate a new application and are running the generator in the project directory?');
      return process.exit(1);
    }

    if(!(this.pkg.directories && this.pkg.directories.lib)) {
      this.log.error('It does not look like this application has been generated with this version of the generator or the required `directories.lib` has been removed from package.json.');
      return process.exit(1);
    }
  }

  get testLibrary () {
    return this.props.tester || (this.pkg.devDependencies.jest ? 'jest' : 'mocha');
  }

  get libDirectory() {
    return this.pkg.directories && this.pkg.directories.lib;
  }

  get testDirectory() {
    return (this.pkg.directories && this.pkg.directories.test) || 'test';
  }
  
  get configDirectory () {
    return (this.pkg.directories && this.pkg.directories.config) || 'config';
  }

  get isTypescript () {
    const pkg = this.fs.readJSON(this.destinationPath('package.json'));
    const configFile = this.destinationPath('config', 'default.json');

    let hasTS = pkg && pkg.types;

    if (!hasTS && this.fs.exists(configFile)) {
      const config = this.fs.readJSON(configFile);

      hasTS = config && config.ts;
    }

    return hasTS || (this.props.language === 'ts');
  }
  
  get srcType () {
    return this.isTypescript ? 'ts' : 'js';
  }

  srcTemplatePath (... names) {
    const name = `${names.pop()}.${this.srcType}`;

    return this.templatePath(...names, name);
  }

  srcDestinationPath (...names) {
    const name = `${names.pop()}.${this.srcType}`;

    return this.destinationPath(...names, name);
  }

  templatePath (...paths) {
    return super.templatePath(this.srcType, ...paths);
  }

  _packagerInstall(deps, options) {
    const packager = this.pkg.engines && this.pkg.engines.yarn ?
      'yarn' : 'npm';
    const method = `${packager}Install`;
    const isDev = options.saveDev;
    const existingDependencies = this.pkg[isDev ? 'devDependencies' : 'dependencies'] || {};
    const dependencies = deps.filter(current => !existingDependencies[current])
      .map(dependency => {
        const version = this.generatorPkg.devDependencies[dependency];

        if(!version) {
          debug(`No locked version found for ${dependency}, installing latest.`);

          return dependency;
        }

        return `${dependency}@${version}`;
      });

    if(packager === 'yarn' && isDev) {
      options.dev = true;
      delete options.saveDev;
    }

    return this[method](dependencies, options);
  }
};
