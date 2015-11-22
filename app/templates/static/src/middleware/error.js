// jshint unused:false
import path from 'path';

export default function(error, req, res, next) {
  const app = req.app;
  const code = error.code || 500;

  res.status(code);

  res.format({
    'text/html': function() {
      const file = code === 404 ? '404.html' : 'error.html';
      res.sendFile(path.join(app.get('public'), file));
    },

    'application/json': function () {
      let output = {
        code,
        message: error.message,
        name: error.name || 'General error'
      };

      if(app.settings.env !== 'production') {
        output.stack = error.stack;
      }

      res.json(output);
    }
  });
}
