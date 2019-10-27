const { MongoClient } = require('mongodb');

module.exports = class DB {
	static async connect() {
		const options = { useUnifiedTopology: true };

		let url = 'mongodb://';

		if (process.env.DB_USER) {
			url += `${process.env.DB_USER}:${process.env.DB_PASSWORD}@`;
		}

		url += `${process.env.DB_HOST}:${process.env.DB_PORT}`;

		DB.client = new MongoClient(url, options);

		let connection;

		try {
			connection = await DB.client.connect();
		} catch (error) {
			console.log(error);
			process.exit(1);
		}

		DB.connection = connection.db(process.env.DB_NAME);
		console.log(`Connected to db: ${process.env.DB_NAME}`);
	}

	static get() {
		return DB.connection;
	}

	static close() {
		DB.client.close();
	}
};
