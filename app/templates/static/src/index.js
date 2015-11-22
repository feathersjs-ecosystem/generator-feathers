require('babel-core/register');

var app = require('./app');
var port = app.get('port');
var server = app.listen(port);

server.on('listening', function() {
  console.log('Feathers application started on port ' + port);
});
