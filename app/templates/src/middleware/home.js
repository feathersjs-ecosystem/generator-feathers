export default function(req, res) {
  const services = req.app.services;

  res.format({
    'text/html': function() {
      const list = Object.keys(services)
        .map(name => `<li><a href="/${name}">${name}</a></li>`);

      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Feathers API</title>
          </head>
          <body>
            <h1>Welcome to your Feathers API</h1>
            <p>The following services are available:</p>
            <ul>${list}</ul>
          </body>
        </html>
      `);
    },

    'application/json': function () {
      res.json({
        services: Object.keys(services)
      });
    }
  });
}
