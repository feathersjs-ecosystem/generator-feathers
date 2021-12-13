const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');

const { startAndWait } = require('./utils');

describe('generator-feathers', function() {
  const tester = process.env.GENERATOR_TESTER || 'mocha';

  let appDir;
  
  this.timeout(300000);

  function npmTest(expectedText) {
    return startAndWait('npm', ['test'], { cwd: appDir })
      .then(({ buffer }) => {
        if (tester === 'mocha') {
          assert.ok(buffer.indexOf(expectedText) !== -1,
            'Ran test with text: ' + expectedText);
        }
      });
  }

  const runTest = adapter => () => {
    const prompts = {
      name: 'myapp',
      language: process.env.GENERATOR_LANGUAGE || 'js',
      authentication: true,
      providers: ['rest', 'socketio'],
      packager: 'npm',
      src: 'src',
      tester,
      adapter,
      strategies: ['local']
    };

    if (adapter === 'sequelize' || adapter === 'knex' || adapter === 'objection') {
      prompts.database = 'sqlite';
    }

    before(() => helpers.run(path.join(__dirname, '..', 'generators', 'app'))
      .inTmpDir(dir => (appDir = dir))
      .withPrompts(prompts)
      .withOptions({
        skipInstall: false
      })
    );

    it('basic app tests', () => npmTest('starts and shows the index page'));

    it('feathers:hook', async () => {
      await helpers.run(path.join(__dirname, '../generators/hook'))
        .inTmpDir(function() {
          process.chdir(appDir);
        })
        .withPrompts({
          name: 'removeId',
          type: 'before',
          services: [ 'users' ],
          methods: [ 'create' ]
        });

      await npmTest('starts and shows the index page');
    });

    it('feathers:middleware', async () => {
      await helpers.run(path.join(__dirname, '../generators/middleware'))
        .inTmpDir(function() {
          process.chdir(appDir);
        })
        .withPrompts({
          name: 'testmiddleware',
          path: '*'
        });
    });
  };
  
  describe('with memory adapter', runTest('memory'));
  describe('with nedb adapter', runTest('nedb'));
  describe('with sequelize adapter', runTest('sequelize'));
  describe('with knex adapter', runTest('knex'));
  describe.skip('with objection adapter', runTest('objection'));
  
  describe('with mongoose adapter', runTest('mongoose'));
  // Needs to be skipped for now due to the async setup
  (tester === 'jest' ? describe.skip : describe)('with mongodb adapter', runTest('mongodb'));
});
