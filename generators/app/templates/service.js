'use strict';
<% if (localAuth ||authentication.length) { %>const authentication = require('./authentication');<% } %>
<% for (var i = 0; i < services.length; i++) { %>const <%= services[i] %> = require('./<%= services[i] %>');
<% } %>
module.exports = function() {
  const app = this;
  <% if (localAuth || authentication.length) { %>
  app.configure(authentication);<% } %><% for (var i = 0; i < services.length; i++) { %>
  app.configure(<%= services[i] %>);<% } %>
};
