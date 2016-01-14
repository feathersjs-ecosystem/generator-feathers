import hooks from '../hooks';
import service from 'feathers-sequelize';
import User from '../models/user';

export default function(){
  const app = this;
  
  let options = {
    Model: User(app.get('sequelize')),
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