require('dotenv').config();
const DB = require('./utils/db');
const server = require('./server/server');

const init = async () => {
	await DB.connect();
	server.start();
};

init();
