const Logger = require('../game/logger');
const Battle = require('../game/battle');


module.exports = {
	async resumeGames() {
		const logs = await Logger.loadInProgess();
		logs.forEach((log) => {
			Battle.fromLog(log);
		});
	},
};
