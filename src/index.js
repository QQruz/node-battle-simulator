require('dotenv').config();
const DB = require('./utils/db');
const server = require('./server/server');
const shutdown = require('./utils/shutdown');
const boot = require('./utils/boot');

const init = async () => {
	await DB.connect();

	shutdown.addTerminationListeners();

	boot.resumeGames();

	server.start();
};

init();
