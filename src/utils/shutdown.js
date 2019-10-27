const DB = require('./db');
const Battle = require('../game/battle');

module.exports = {
	addTerminationListeners() {
		const events = [
			// missed some for sure :(
			'uncaughtException',
			'unhandledRejection',
			'beforeExit',
			'SIGTERM',
			'SIGINT',
			'SIGPIPE',
			'SIGUSR1',
			'SIGHUP',
			'SIGBREAK',
		];

		events.forEach((event) => {
			process.on(event, () => {
				console.log(`Terminating: ${event}`);
				Promise.all(Battle.getRegistry().map((game) => game.save()))
					.then(() => {
						DB.close();
						process.exit(1);
					});
			});
		});
	},
};
