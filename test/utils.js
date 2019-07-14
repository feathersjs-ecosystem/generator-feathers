const cp = require('child_process');

exports.startAndReturn = (cmd, args, options) => {
  return cp.spawn(cmd, args, options);
};

// Start a process and wait either for it to exit
// or to display a certain text
exports.startAndWait = (cmd, args, options, text) => {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const child = cp.spawn(cmd, args, options);
    const addToBuffer = data => {
      buffer += data;

      if(text && buffer.indexOf(text) !== -1) {
        resolve({ buffer, child });
      }
    };

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', status => {
      if(status !== 0) {
        return reject(new Error(buffer));
      }

      resolve({ buffer, child });
    });
  });
};
