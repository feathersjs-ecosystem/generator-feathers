'use strict';
const updateNotifier = require('update-notifier');
const chalk = require('chalk');
const stringLength = require('string-length');
const repeating = require('repeating');
const spawn = require('cross-spawn-async');
const pkg = require('../package.json');
/**
 * Generates the message to display when a new update is available
 * @param  {Object} update - The update object coming from update-notifier
 * @returns {String}        - The message to display
 */
const makeMessage = function(update) {
    const line1 = ' Update available: ' + chalk.green.bold(update.latest) +
        chalk.dim(' (current: ' + update.current + ')') + ' ';
    const line2 = ' Run ' + chalk.green('npm install -g ' + update.name) +
        ' to update. ';
    const contentWidth = Math.max(stringLength(line1), stringLength(line2));
    const line1rest = contentWidth - stringLength(line1);
    const line2rest = contentWidth - stringLength(line2);
    const top = chalk.yellow('┌' + repeating('─', contentWidth) + '┐');
    const bottom = chalk.yellow('└' + repeating('─', contentWidth) + '┘');
    const side = chalk.yellow('│');

    const message =
        '\n' +
        top + '\n' +
        side + line1 + repeating(' ', line1rest) + side + '\n' +
        side + line2 + repeating(' ', line2rest) + side + '\n' +
        bottom + '\n';
    return message;
};

/**
 * Notify if the generator should be updated
 * @param {Function} cb - The callback function
 */
const notifyUpdate = function(cb) {
    if ((this.options || {}).disableNotifyUpdate) {
      return cb();
    }

    updateNotifier({
        pkg: pkg,
        callback: function(error, update) {
            if (error) {
                cb();
                return;
            }
            if (update.latest !== update.current) {
                const message = makeMessage(update);
                this.log(message);
                const prompts = [{
                  name: 'updateGenerator',
                  type: 'list',
                  message: 'Do you want to update this generator?',
                  choices: [
                    {
                      name: 'Yes (stops the generator and runs npm install -g generator-feathers)',
                      value: 'yes'
                    },
                    {
                      name: 'No (continues running the generator)',
                      value: 'no'
                    },
                    {
                      name: 'Get me out of here',
                      value: 'leave'
                    }
                  ]
                }];
                this.prompt(prompts).then(function (props) {
                  if(props.updateGenerator === 'yes') {
                    spawn('npm', ['install', '-g', 'generator-feathers'], {stdio: 'inherit'})
                      .on('close', function(){
                        process.exit();
                      });
                  } else if (props.updateGenerator === 'leave') {
                    process.exit();
                  } else {
                    cb();
                  }
                }.bind(this));
            } else {
                cb();
            }
        }.bind(this)
    });
};

module.exports = {
    extend: function(generator) {
        const mixins = generator.mixins = generator.mixins || {};
        mixins.notifyUpdate = notifyUpdate.bind(generator);
    }
};
