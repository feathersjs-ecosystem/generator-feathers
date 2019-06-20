import feathers, { Application} from '@feathersjs/feathers';
import <%= camelName %> from '../../<%= libDirectory %>/hooks/<%= kebabName %>';

describe('\'<%= name %>\' hook', () => {
  let app: Application;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id: any) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      <% if(type){ %><%= type %>: <%= camelName %>()<% } %>
    });
  });

  it('runs the hook', async () => {
    expect.assertions(1);
    const result = await app.service('dummy').get('test');
    expect(result).toEqual({ id: 'test' });
  });
});
