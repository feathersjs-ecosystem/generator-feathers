import assert from 'assert';
import app from '<%= relativeRoot %><%= libDirectory %>/app';

describe('\'<%= name %>\' service', () => {
  it('registered the service', () => {
    const service = app.service('<%= path %>');

    assert.ok(service, 'Registered the service');
  });
});
