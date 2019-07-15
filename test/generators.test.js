const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const axios = require('axios');

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
    describe(`with ${adapter} users service`, () => {
      before(() => helpers.run(path.join(__dirname, '..', 'generators', 'app'))
        .inTmpDir(dir => (appDir = dir))
        .withPrompts({
          name: 'myapp',
          language: process.env.GENERATOR_LANGUAGE || 'js',
          authentication: true,
          providers: ['rest', 'socketio'],
          packager: 'npm',
          src: 'src',
          tester,
          adapter,
          strategies: ['local']
        })
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

      it('starts app, creates user and authenticates', async () => {
        const { child } = await startAndWait('npm', ['start'], { cwd: appDir }, 'Feathers application started');
        const user = {
          email: 'hello@feathersjs.com',
          password: 'supersecret'
        };

        await axios.post('http://localhost:3030/users', user);

        const { data } = await axios.post('http://localhost:3030/authentication', {
          ...user,
          strategy: 'local'
        });

        assert.ok(data.accessToken);
        assert.strictEqual(data.user.email, user.email);

        child.kill('SIGHUP');
      });
    });
  }
  
  runTest('memory');
  // runTest('nedb');
  // runTest('mongodb');
  // runTest('mongoose');
});
