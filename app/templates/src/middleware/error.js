export default function(error, req, res, next) {
  res.status(error.code || 500);

  res.format({
    'text/html': function() {
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Feathers error</title>
          </head>
          <body>
            <h1>Ooop, something went wrong</h1>
            <p>${error.message}</p>
          </body>
        </html>
      `);
    },

    'application/json': function () {
      res.json(error);
    }
  });
}
