'use strict';

const randomstring = require('randomstring');

module.exports = function() {
  const config = {
    host: 'localhost',
    port: 3030,
    public: '../public/',
    authentication: {
      secret: randomstring.generate(),
      strategies: []
    }
  };

  return config;
};
