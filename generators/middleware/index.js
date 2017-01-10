'use strict';

const Generator = require('../../lib/generator');
// const { kebabCase } = require('lodash');
// const j = require('../../lib/transform');

module.exports = class DatabaseGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.props = {};
  }
};
