const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const <%= camelName %> = require('<%= appDir %>/<%= libDirectory %>/hooks/<%= kebabPath %>');

describe('\'<%= name %>\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      get(id) {
        return Promise.resolve({ id });
      }
    });

    app.service('dummy').hooks({
      <% if(type){ %><%= type %>: <%= camelName %>()<% } %>
    });
  });

  it('runs the hook', () => {
    return app.service('dummy').get('test').then(result => {
      assert.deepEqual(result, { id: 'test' });
    });
  });
});
