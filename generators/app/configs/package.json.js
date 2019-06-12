const semver = require('semver');

module.exports = function(generator) {
  const major = semver.major(process.version);
  const envConfigDir = process.env['NODE_CONFIG_DIR'];
  const configDirectory = envConfigDir ? p.join(envConfigDir) : 'config/';
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
    author: {
      name: generator.user.git.name(),
      email: generator.user.git.email()
    },
    contributors: [],
    bugs: {},
    directories: {
      lib,
      test: 'test/',
      config: configDirectory
    },
    engines: {
      node: `^${major}.0.0`,
      [packager]: version
    },
    'scripts': {
      test: `${packager} run eslint && NODE_ENV= ${packager} run ${props.tester}`,
      eslint: `eslint ${lib}/. test/. --config .eslintrc.json`,
      dev: props.ts ? `ts-node-dev --no-notify ${lib}/` : `nodemon ${lib}/`,
      start: props.ts ? 'shx rm -rf lib/ && tsc && node lib/' : `node ${lib}/`
    }
  };
  if ('mocha' === props.tester) {
    pkg.scripts['mocha'] = props.ts ? 'ts-mocha "test/**/*.ts"' : 'mocha test/ --recursive --exit';
  } else {
    pkg.scripts['jest'] = 'jest';
  }

  if (props.ts) {
    pkg.scripts['test'] = `NODE_ENV= ${packager} run ${props.tester}`;
    delete pkg.scripts['eslint'];
  }

  return pkg;
};
