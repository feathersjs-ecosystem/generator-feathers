'use strict';

const randomstring = require('randomstring');

module.exports = function() {
  const config = {
    host: 'localhost',
    port: 3030,
    public: '../public/',
    paginate: {
      default: 10,
      max: 50
    },
    authentication: {
      secret: randomstring.generate(),
      strategies: []
    }
  };

  return config;
};
