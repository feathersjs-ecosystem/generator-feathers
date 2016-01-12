import hooks from '../hooks';
<% if (database && (database !== 'Memory' && database !== 'NeDB')) { %>import User from '../models/user';<% } %>
<% if (database === 'Memory') { %>
import service from 'feathers-memory';
const User = {};
<% } %>
<% if (database === 'NeDB') { %>
import NeDB from 'feathers-nedb';
import service from 'feathers-nedb';
let User = new NeDB({
  filename: './data/users.db',
  autoload: true
});
<% } %><% if (database === 'MongoDB') { %>
import mongoose from 'mongoose';
import service from 'feathers-mongoose';
mongoose.connect('mongodb://localhost:27017/feathers');
mongoose.Promise = global.Promise;
<% } %>

export default function(){
  const app = this;
  /* * * Do any connection stuff here, if needed * * */

  /* * * Service Type * * */
  let options = {
    Model: User,
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use('/v1/users', service(options));

  // const service = this.service('v1/users');

  /* * * Before hooks * * */
  // service.before({
  //   all:   [hooks.requireAuthForPrivate()],
  //   before: [hooks.setUserID()]
  // });

  // /* * * After hooks * * */
  // service.after({
  //   all: [hooks.removeSomeField()]
  // });

  // /* * * Set up event filters * * */
  // service.created = service.updated = service.patched = service.removed = events.requireAuthForPrivate;
}