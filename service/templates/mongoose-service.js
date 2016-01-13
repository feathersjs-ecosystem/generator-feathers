import hooks from '../hooks';
import mongoose from 'mongoose';
import service from 'feathers-mongoose';
import <%= name %> from '../models/<%= name %>';

mongoose.Promise = global.Promise;

export default function(){
  const app = this;
  
  mongoose.connect(app.get('mongodb'));

  let options = {
    Model: <%= name %>,
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use(<% if (version) { %>'/<%= version %>/<%= name %>'<% } else { %>'/<%= name %>'<% } %>, service(options));

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