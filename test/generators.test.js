'use strict';

const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const exec = require('child_process').exec;
const rp = require('request-promise');

// Start a process and wait either for it to exit
// or to display a certain text
function startAndWait(cmd, options, text) {
  return new Promise((resolve, reject) => {
    let buffer = '';
  
    const child = exec(cmd, options);
    const addToBuffer = data => {
      buffer += data;

      if(text && buffer.indexOf(text) !== -1) {
        resolve({ buffer, child });
      }
    };

    child.stdout.on('data', addToBuffer);
    child.stderr.on('data', addToBuffer);

    child.on('exit', status => {
      if(status !== 0) {
        return reject(new Error(buffer));
      }

      resolve({ buffer, child });
    });
  });
}

function delay(ms) {
  return function(res) {
    return new Promise(resolve => setTimeout(() => resolve(res), ms));
  };
}

describe('generator-feathers', function() {
  let appDir;

  function runTest(expectedText) {
    return startAndWait('yarn test', { cwd: appDir })
      .then(({ buffer }) => {
        assert.ok(buffer.indexOf(expectedText) !== -1,
          'Ran test with text: ' + expectedText);
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

  describe('feathers:connection', () => {
    function runConnectionGenerator(prompts) {
      return helpers.run(path.join(__dirname, '../generators/connection'))
        .inTmpDir(() => process.chdir(appDir))
        .withPrompts(prompts)
        .withOptions({ skipInstall: false });
    }

    it('nedb', () => {
      return runConnectionGenerator({
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

      return runConnectionGenerator({
        type: 'mongodb',
        connectionString
      })
      .then(() => 
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'),
          { mongodb: connectionString }
        )
      )
      .then(() => runTest('starts and shows the index page'));
    });

    it('mongoose', () => {
      const connectionString = 'mongodb://localhost:27017/testing';

      return runConnectionGenerator({
        type: 'mongoose',
        connectionString
      })
      .then(() => 
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'),
          { mongodb: connectionString }
        )
      )
      .then(() => runTest('starts and shows the index page'));
    });

    it('knex', () => {
      const connectionString = 'sqlite://data.sqlite';

      return runConnectionGenerator({
        type: 'knex',
        connectionString
      })
      .then(() => 
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'), {
            knex: {
              connection: {
                filename: 'data.sqlite'
              },
              client: 'sqlite3'
            }
          }
        )
      )
      .then(() => runTest('starts and shows the index page'));
    });

    it('sequelize', () => {
      const connectionString = 'sqlite://data.sqlite';

      return runConnectionGenerator({
        type: 'sequelize',
        connectionString
      })
      .then(() => 
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'), {
            sequelize: connectionString
          }
        )
      )
      .then(() => runTest('starts and shows the index page'));
    });

    it('rethinkdb', () => {
      return runConnectionGenerator({
        type: 'rethinkdb',
        connectionString: 'rethinkdb://localhost:11078/testing'
      })
      .then(() => 
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'), {
            rethinkdb: {
              database: 'testing',
              servers: [
                {
                  host: 'localhost',
                  port: 11078
                }
              ]
            }
          }
        )
      )
      .then(() => runTest('starts and shows the index page'));
    });
  });

  describe('feathers:service', () => {
    function testServiceGenerator(type, id = null) {
      return helpers.run(path.join(__dirname, '../generators/service'))
        .inTmpDir(() => process.chdir(appDir))
        .withPrompts({
          type,
          name: type,
          path: type
        })
        .withOptions({ skipInstall: false })
        .then(() => startAndWait('node src/', { cwd: appDir }, 'Feathers application started'))
        .then(delay(1000))
        .then(({ child }) => {
          const text = 'This is a test';

          return rp({
            url: `http://localhost:3030/${type}`,
            method: 'post',
            json: true,
            body: { text }
          })
          .then(response => {
            if(id) {
              assert.ok(typeof response[id] !== 'undefined');
            }
            
            assert.equal(response.text, text);
          })
          .then(() => child.kill())
          .catch(e =>
            new Promise((resolve, reject) => {
              child.once('exit', () => reject(e));
              child.kill();
            })
          );
        });
    }

    it('generic', () => testServiceGenerator('generic'));
    it('memory', () => testServiceGenerator('memory', 'id'));
    it('nedb', () => testServiceGenerator('nedb', '_id'));
    it('mongodb', () => testServiceGenerator('mongodb', '_id'));
    it('mongoose', () => testServiceGenerator('mongoose', '_id'));
    it('knex', () => testServiceGenerator('knex', 'id'));
    it('sequelize', () => testServiceGenerator('sequelize', 'id'));
    
    it.skip('rethinkdb', () => testServiceGenerator('rethinkdb', 'id'));
  });
});
