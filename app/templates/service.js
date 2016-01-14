// jshint unused:false
import userService from './user';
<% if (database === 'mongodb') { %>import mongoose from 'mongoose';<% } %>

export default function() {
  const app = this;
  <% if (database === 'mongodb') { %>
  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;<% } %>

  app.configure(userService);
}
