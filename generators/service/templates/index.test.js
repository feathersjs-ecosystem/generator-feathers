'use strict';

var assert = require('assert');
var app = require('../../../src/app');

describe('<%= name %> service', function() {
  it('registered the <%= pluralizedName %> service', (done) => {
    assert.ok(app.service('<%= pluralizedName %>'));

    done();
  });
});
