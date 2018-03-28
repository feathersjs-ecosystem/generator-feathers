const {snakeCase, kebabCase, camelCase} = require('lodash');
const path = require('path');

/**
 * Given a name with periods, replace those periods with /. Replace any other separators with snakeCase.
 * @param name
 * @returns {string}
 */
const snakePath = (name) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = snakeCase(nameSpace[i]);
  }

  return nameSpace.join('/');
};

/**
 * Given a name with periods, replace those periods with /. Replace any other separators with kebabCase.
 * @param name
 * @returns {string}
 */
const kebabPath = (name) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = kebabCase(nameSpace[i]);
  }

  return nameSpace.join('/');
};

/**
 * Given a name with periods, replace those periods with /. Replace any other separators with camelCase.
 * @param name
 * @returns {string}
 */
const camelPath = (name) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = camelCase(nameSpace[i]);
  }

  return nameSpace.join('/');
};

/**
 * Escape the given name with the given filter IE kebabName, snakeName, etc, and preserve any periods.
 * @param name
 * @param filter
 * @returns {string}
 */
const dotName = (name, filter) => {
  let nameSpace = name.split('.');
  for (let i = nameSpace.length - 1; i > -1; i--) {
    nameSpace[i] = filter(nameSpace[i]);
  }

  return nameSpace.join('.');
};

/**
 * Given a path, create a path of ../ sufficent to back out of the directory completely
 * @param dir
 * @returns {string}
 */
const backOutOf = (...dir) => {
  return path.join(...(path.join(...dir).replace(/\\g/, '/').split('/').map(() => '..')));
};


module.exports = {kebabPath, snakePath, camelPath, dotName, backOutOf};
