import { join } from 'path';
import hooks from '../hooks';
import NeDB from 'nedb';
import service from 'feathers-nedb';


export default function(){
  const app = this;

  const db = new NeDB({
    filename: join(app.get('nedb'), '<%= name %>.db'),
    autoload: true
  });

  let options = {
    paginate: {
      Model: db,
      default: 5,
      max: 25
    }
  };

  app.use(<% if (version) { %>'/<%= version %>/<%= name %>'<% } else { %>'/<%= name %>'<% } %>, service(options));
}