// <%= name %>-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = app => {
  const mongooseClient = app.get('mongooseClient');
  const <%= camelName %> = new mongooseClient.Schema({
  <% if(authentication.strategies.indexOf('local') !== -1) { %>
    email: {type: String, unique: true, lowercase: true},
    password: { type: String },
  <% } %>
  <% authentication.oauthProviders.forEach(provider => { %>
    <%= provider %>Id: { type: String },
  <% }); %>
  }, {
    timestamps: true
  });

  return mongooseClient.model('<%= camelName %>', <%= camelName %>);
};
