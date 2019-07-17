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

  function runTest (adapter) {
    describe(`with ${adapter} and authentication`, () => {
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

      if (adapter === 'sequelize' || adapter === 'knex') {
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

      it('feathers:hook', () => {
        return helpers.run(path.join(__dirname, '../generators/hook'))
          .inTmpDir(function() {
            process.chdir(appDir);
          })
          .withPrompts({
            name: 'removeId',
            type: 'before',
            services: []
          })
          .then(() => npmTest('\'removeId\' hook'));
      });

      it('feathers:middleware', () => {
        return helpers.run(path.join(__dirname, '../generators/middleware'))
          .inTmpDir(function() {
            process.chdir(appDir);
          })
          .withPrompts({
            name: 'testmiddleware',
            path: '*'
          });
      });
    });
  }
  
  runTest('memory');
  runTest('nedb');
  runTest('mongoose');
  runTest('mongodb');
  runTest('sequelize');
  runTest('knex');
});
