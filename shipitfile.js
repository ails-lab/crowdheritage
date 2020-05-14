
/* eslint-disable no-var */
var chalk = require('chalk');

module.exports = function(shipit) {
	require('shipit-deploy')(shipit);
	// require('shipit-npm')(shipit);

	shipit.initConfig({
		default: {
			workspace: '/tmp/crowdheritage',
			dirToCopy: '/tmp/crowdheritage/dist',
			repositoryUrl: 'git@github.com:ails-lab/crowdheritage.git',
			ignores: ['.git', 'node_modules'],
			rsync: ['--del'],
			keepReleases: 4,
			key: '~/.ssh/id_rsa',
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
		shipit.start('yarn:install');
	});

	shipit.blTask('yarn:install', function() {
		return shipit.local('yarn install', { cwd: shipit.config.workspace }).then(function() {
			shipit.log(chalk.green('Node modules installed.'));
			shipit.start('npm:build');
		}).catch(function(e) {
			shipit.log(chalk.red(e));
		});
	});

	shipit.blTask('npm:build', function() {
		shipit.log('Building production files...');
		return shipit.local('npm run build', { cwd: shipit.config.workspace }).then(function() {
			shipit.local('mv ' + shipit.config.workspace + '/img ' + shipit.config.workspace + '/dist');
		}).catch(function(e) {
			shipit.log(chalk.red(e));
		});
	});
};
