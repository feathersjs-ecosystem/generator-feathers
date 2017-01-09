'use strict';

module.exports = function(options = {}) {
  return function(req, res, next) {
    // Perform actions

    next();
  };
};
