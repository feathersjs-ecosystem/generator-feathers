import _ from 'lodash';
import fs from 'fs';
import { resolve } from 'path';
import config from '../config/config.json';

module.exports = function () {
  return function() {
    const app = this;
    const env = app.settings.env;
    const config = `../config/${env}.json`;

    app.info(`Initializing configuration for ${env} environment`);

    // Dev is our default development. For everything else extend the default
    if(env !== 'development' && fs.existsSync(config)) {
      _.extend(config, require(config));
    }

    _.each(config, (value, name) => {
      if(process.env[value]) {
        value = process.env[value];
      }

      // Make relative paths absolute
      if(typeof value === 'string' &&  (value.indexOf('./') === 0 || value.indexOf('../') === 0)) {
        value = resolve(__dirname, '..', value);
      }

      app.set(name, value);
    });
  };
};
