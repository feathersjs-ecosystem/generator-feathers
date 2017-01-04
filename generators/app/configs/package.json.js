'use strict';

module.exports = function(generator) {
  const { props } = generator;
  const pkg = {
    name: props.name,
    description: props.description,
    version: '0.0.0',
    homepage: '',
    main: 'src/',
    keywords: [
      'feathers'
    ],
    license: 'MIT',
    repository: {},
    author: {},
    contributors: [],
    bugs: {},
    engines: {
      node: '>= 6.0.0'
    },
    'scripts': {
      test: 'npm run jshint && npm run mocha',
      jshint: 'jshint src/. test/. --config',
      start: 'node src/',
      mocha: 'mocha test/ --recursive'
    }
  };

  return pkg;
};
