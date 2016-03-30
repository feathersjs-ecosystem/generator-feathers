'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
<% if (authentication) { %>const auth = require('feathers-authentication').hooks;<% } %>

exports.before = {
  all: [<% if (authentication && name !== 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  <% } %>],
  find: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  <% } %>],
  get: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  <% } %>],
  create: [<% if (authentication && name === 'user') { %>
    auth.hashPassword()
  <% } %>],
  update: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  <% } %>],
  patch: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  <% } %>],
  remove: [<% if (authentication && name === 'user') { %>
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  <% } %>]
};

exports.after = {
  all: [<% if (authentication && name === 'user') { %>hooks.remove('password')<% } %>],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
