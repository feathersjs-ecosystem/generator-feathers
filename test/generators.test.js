'use strict';

const assert = require('assert');
const path = require('path');
const helpers = require('yeoman-generator').test;
const exec = require('child_process').exec;

function pipe(child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

describe('generator-feathers', () => {
  let appDir;
  
  it('feathers:app', done => {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir(dir => appDir = dir)
      .withPrompts({
        name: 'myapp',
        providers: ['rest', 'socketio'],
        cors: 'enabled',
        database: 'nedb',
        authentication: []
      })
      .withOptions({
        skipInstall: false
      })
      .on('end', function () {
        const child = exec('npm test', { cwd: appDir });

        pipe(child);

        child.on('exit', function (status) {
          assert.equal(status, 0, 'Got correct exit status');
          done();
        });
      });
  });
  
  it('feathers:service', done => {
    helpers.run(path.join(__dirname, '../generators/service'))
      .inTmpDir(() => process.chdir(appDir))
      .withPrompts({
        type: 'database',
        database: 'nedb',
        name: 'messages'
      })
      .on('end', function () {
        // TODO somehow test the service here
        done();
      });
  });
  
  it('feathers:hook', done => {
    helpers.run(path.join(__dirname, '../generators/hook'))
      .inTmpDir(() => process.chdir(appDir))
      .withPrompts({
        type: 'before',
        service: 'messages',
        method: ['create', 'update', 'patch'],
        name: 'removeId'
      })
      .on('end', function () {
        // TODO somehow test the service here
        console.log(appDir);
        done();
      });
  });
});