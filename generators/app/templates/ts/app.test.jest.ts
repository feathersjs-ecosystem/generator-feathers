import { Server } from 'http';
import rp from 'request-promise';
import url from 'url';
import app from '../<%= src %>/app';

const port = app.get('port') || 8998;
const getUrl = (pathname?: string) => url.format({
  hostname: app.get('host') || 'localhost',
  protocol: 'http',
  port,
  pathname
});

let server: Server;

describe('Feathers application tests (with jest)', () => {
  beforeAll(done => {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  afterAll(done => {
    server.close(done);
  });

  it('starts and shows the index page', () => {
    expect.assertions(1);
    return rp(getUrl()).then(
      body => expect(body.indexOf('<html lang="en">')).not.toBe(-1)
    );
  });

  describe('404', () => {
    it('shows a 404 HTML page', () => {
      expect.assertions(2);
      return rp({
        url: getUrl('path/to/nowhere'),
        headers: {
          'Accept': 'text/html'
        }
      }).catch(res => {
        expect(res.statusCode).toBe(404);
        expect(res.error.indexOf('<html>')).not.toBe(-1);
      });
    });

    it('shows a 404 JSON error without stack trace', () => {
      expect.assertions(4);
      return rp({
        url: getUrl('path/to/nowhere'),
        json: true
      }).catch(res => {
        expect(res.statusCode).toBe(404);
        expect(res.error.code).toBe(404);
        expect(res.error.message).toBe('Page not found');
        expect(res.error.name).toBe('NotFound');
      });
    });
  });
});
