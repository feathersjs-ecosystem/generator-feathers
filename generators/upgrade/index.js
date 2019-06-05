const Generator = require('../../lib/generator');
const crypto = require('crypto');

const oldPackages = [
  '@feathersjs/authentication-oauth1',
  '@feathersjs/authentication-oauth2',
  '@feathersjs/authentication-jwt'
];

module.exports = class UpgradeGenerator extends Generator {
  writing() {
    const config = this.fs.readJSON(this.destinationPath('config', 'default.json'));
    const dependencies = [ '@feathersjs/authentication-oauth' ];
    
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

    Object.keys(this.pkg.dependencies).forEach(name => {
      const isCore = name.startsWith('@feathersjs/') && !oldPackages.includes(name);
      const isAdapter = name.startsWith('feathers-') && this.generatorPkg.dependencies[name];

      if (isCore || isAdapter) {
        dependencies.push(name);
        delete this.pkg.dependencies[name];
      }
    });

    this.conflicter.force = true;
    
    this.fs.copy(
      this.destinationPath(this.libDirectory, 'authentication.js'),
      this.destinationPath(this.libDirectory, 'authentication.backup.js')
    );
    this.fs.copy(
      this.destinationPath('config', 'default.json'),
      this.destinationPath('config', 'default.backup.json')
    );

    this.fs.copy(
      this.templatePath('authentication.js'),
      this.destinationPath(this.libDirectory, 'authentication.js')
    );
    this.fs.writeJSON(this.destinationPath('config', 'default.json'), config);
    this.fs.writeJSON(this.destinationPath('package.json'), this.pkg);
    this._packagerInstall(dependencies, {
      save: true
    });
  }
};
