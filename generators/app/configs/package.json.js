const p = require('path');
const semver = require('semver');

module.exports = function(generator) {
  const major = semver.major(process.version);
  const envConfigDir = process.env['NODE_CONFIG_DIR'];
  const configDirectory = envConfigDir ? p.join(envConfigDir) : 'config/';
  const { props } = generator;
  const lib = props.src;
  const [ packager, version ] = props.packager.split('@');
  const isTypescript = props.language === 'ts';
  const lintScripts = {
    eslint: !isTypescript ? 
      `eslint ${lib}/. test/. --config .eslintrc.json --fix` :
      `eslint ${lib}/. test/. --config .eslintrc.json --ext .ts --fix`,
    standard: 'standard'
  };

  const pkg = {
    name: props.name,
    description: props.description,
    version: '0.0.0',
    homepage: '',
    private: true,
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
    scripts: {
      test: `${packager} run lint && ${packager} run ${props.tester}`,
      lint: lintScripts[props.linter],
      dev: `nodemon ${lib}/`,
      start: `node ${lib}/`
    },
    standard: {
      env: [props.tester],
      ignore: []
    }
  };

  if ('mocha' === props.tester) {
    pkg.scripts['mocha'] = isTypescript ? 'mocha --require ts-node/register --require source-map-support/register "test/**/*.ts" --recursive --exit' : 'mocha test/ --recursive --exit';
  } else {
    pkg.scripts['jest'] = 'jest --forceExit';
  }

  if (isTypescript) {
    pkg.scripts = {
      ...pkg.scripts,
      compile: 'shx rm -rf lib/ && tsc',
      dev: `ts-node-dev --no-notify ${lib}/`,
      test: (props.linter === 'eslint') ?
        `${packager} run lint && ${packager} run compile && ${packager} run ${props.tester}` : 
        `${packager} run compile && ${packager} run ${props.tester}`,
      start: `${packager} run compile && node lib/`
    };
    pkg.types = 'lib/';

    if (props.linter === 'standard') delete pkg.scripts.lint;
  }

  return pkg;
};
