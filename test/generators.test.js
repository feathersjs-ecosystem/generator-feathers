'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const exec = require('child_process').exec;

describe('generator-feathers', function() {
  let appDir;

  function runTest(expectedText) {
    return new Promise((resolve, reject) => {
      let buffer = '';
    
      const child = exec('yarn test', { cwd: appDir });
      const addToBuffer = data => {
        buffer += data;
      };

      child.stdout.on('data', addToBuffer);
      child.stderr.on('data', addToBuffer);

      child.on('exit', status => {
        if(status !== 0) {
          return reject(new Error(buffer));
        }
        
        assert.ok(buffer.indexOf(expectedText) !== -1,
          'Ran test with text: ' + expectedText);
        resolve();
      });
    });
  }

  before(() => helpers.run(path.join(__dirname, '../generators/app'))
    .inTmpDir(dir => (appDir = dir))
    .withPrompts({
      name: 'myapp',
      providers: ['rest', 'socketio'],
      src: 'src',
      packager: 'yarn@>= 0.18.0'
    })
    .withOptions({
      skipInstall: false
    })
  );

  it('feathers:app', () => runTest('starts and shows the index page'));

  describe('feathers:connection', () => {

    it('nedb', () => {
      return helpers.run(path.join(__dirname, '../generators/connection'))
        .inTmpDir(() => process.chdir(appDir))
        .withPrompts({
          type: 'nedb',
          connectionString: 'nedb://../mytest'
        })
        .then(() => 
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'),
            { nedb: '../mytest' }
          )
        )
        .then(() => runTest('starts and shows the index page'));
    });

    it('mongodb', () => {
      const connectionString = 'mongodb://localhost:27017/testing';

      return helpers.run(path.join(__dirname, '../generators/connection'))
        .inTmpDir(() => process.chdir(appDir))
        .withPrompts({
          type: 'mongodb',
          connectionString
        })
        .withOptions({
          skipInstall: false
        })
        .then(() => 
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'),
            { mongodb: connectionString }
          )
        )
        .then(() => runTest('starts and shows the index page'));
    });

    it.skip('mongoose', function() {});
    it.skip('knex', function() {});
    it.skip('sequelize', function() {});
    it.skip('rethinkdb', function() {});
  });

  // it('feathers:service(generic)', function(done) {
  //   helpers.run(path.join(__dirname, '../generators/service'))
  //     .inTmpDir(function() {
  //       process.chdir(appDir);
  //     })
  //     .withPrompts({
  //       type: 'generic',
  //       name: 'tests'
  //     })
  //     .on('end', function() {
  //       runTest('registered the tests service', done);
  //     });
  // });

  // it('feathers:hook', function(done) {
  //   helpers.run(path.join(__dirname, '../generators/hook'))
  //     .inTmpDir(function() {
  //       process.chdir(appDir);
  //     })
  //     .withPrompts({
  //       type: 'before',
  //       service: 'messages',
  //       method: ['create', 'update', 'patch'],
  //       name: 'removeId'
  //     })
  //     .on('end', function() {
  //       runTest('hook can be used', done);
  //     });
  // });
});
