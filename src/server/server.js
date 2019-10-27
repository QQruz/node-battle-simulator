const express = require('express');
const routes = require('./routes');

const server = express();

server.use(express.json());
server.use(routes);

const port = process.env.PORT || process.env.CUSTOM_PORT;

const start = () => {
	server.listen(port, () => {
		console.log(`Server is up on port: ${port}`);
	});
};

module.exports = { start };
