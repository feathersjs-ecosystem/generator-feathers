const {snakeCase, kebabCase, camelCase} = require('lodash');
const path = require('path');

const snakePath = (name) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = snakeCase(nameSpace[i]);
  }

  return nameSpace.join('/');
};

const kebabPath = (name) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = kebabCase(nameSpace[i]);
  }

  return nameSpace.join('/');
};

const camelPath = (name) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = camelCase(nameSpace[i]);
  }

  return nameSpace.join('/');
};

const dotName = (name, filter) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = filter(nameSpace[i]);
  }

  return nameSpace.join('.');
};

const backOutOf = (...dir) => {
  return path.join(...(path.join(...dir).replace(/\\g/, '/').split('/').map(() => '..')));
};


module.exports = {kebabPath, snakePath, camelPath, dotName, backOutOf};
