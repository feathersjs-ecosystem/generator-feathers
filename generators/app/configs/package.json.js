'use strict';

module.exports = function(generator) {
  const { props } = generator;
  const lib = props.src;
  const [ packager, version ] = props.packager.split('@');
  const pkg = {
    name: props.name,
    description: props.description,
    version: '0.0.0',
    homepage: '',
    main: lib,
    keywords: [
      'feathers'
    ],
    license: 'MIT',
    repository: {},
    author: {},
    contributors: [],
    bugs: {},
    directories: {
      lib
    },
    engines: {
      node: '>= 6.0.0',
      [packager]: version
    },
    'scripts': {
      test: 'npm run jshint && npm run mocha',
      jshint: `jshint ${lib}/. test/. --config`,
      start: `node ${lib}/`,
      mocha: 'mocha test/ --recursive'
    }
  };

  return pkg;
};
