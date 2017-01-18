'use strict';

// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

module.exports = function(options = {}) {
  return function(hook) {
    hook.<%= camelName %> = true;
    console.log('\'<%= name %>\' hook ran');
  };
};
