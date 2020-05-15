
/* eslint-disable no-var */
var chalk = require('chalk');

module.exports = function(shipit) {
    require('shipit-deploy')(shipit);
    // require('shipit-npm')(shipit);

    shipit.initConfig({
        default: {
            dirToCopy: 'dist',
            repositoryUrl: 'git@github.com:ails-lab/crowdheritage.git',
            ignores: ['.git', 'node_modules'],
            rsync: ['--del'],
            keepReleases: 4,
            key: '~/.ssh/id_rsa',
            // Setting shallowClone makes workspace obsolete.
            // See https://github.com/shipitjs/shipit/issues/194
            shallowClone: true,
            npm: {
                remote: false,
                triggerEvent: 'fetched'
            }
        },
        staging: {
            servers: 'deploy@ipa.image.ntua.gr',
            deployTo: '/data/withfrontend',
            branch: 'master'
        },
        production: {
            servers: 'deploy@playmobil.image.ntua.gr',
            deployTo: '/data/withcrowd/frontend',
            branch: 'master'
        }
    });

    shipit.on('fetched', function() {
        shipit.start('copyConfig');
    });

    shipit.blTask('copyConfig', function() {
        shipit.log('Copying local configuration file...');
        return shipit.local('cp src/conf/local.config.js ' + shipit.workspace + '/src/conf').then(function() {
            shipit.start('yarn:install');
        }).catch(function(e) {
            shipit.log(chalk.read(e));
        });
    });

    shipit.blTask('yarn:install', function() {
        shipit.log('Installing Node modules...');
        return shipit.local('yarn install', { cwd: shipit.workspace }).then(function() {
            shipit.log(chalk.green('Node modules installed.'));
            shipit.start('npm:build');
        }).catch(function(e) {
            shipit.log(chalk.red(e));
        });
    });

    shipit.blTask('npm:build', function() {
        shipit.log('Building production files...');
        return shipit.local('npm run build', { cwd: shipit.workspace }).then(function() {
            shipit.local('mv ' + shipit.workspace + '/img ' + shipit.workspace + '/dist');
        }).catch(function(e) {
            shipit.log(chalk.red(e));
        });
    });
};
