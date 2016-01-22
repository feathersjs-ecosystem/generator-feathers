// Read all hooks from the file system and arrange them into a single object.
import fs from 'fs';

let hooks = {};

fs.readdir(__dirname, (err, files) => {
  files.forEach(fileName => {
    if (fileName.indexOf('.js') >= 0 && fileName !== 'index.js') {
      fileName = fileName.replace('.js', '');
      let camelCased = fileName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
      let module = require('./' + fileName);
      module = module.default ? module.default : module;
      hooks[camelCased] = module;
    }
  });
});

export default hooks;
