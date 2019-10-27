const Logger = require('../game/logger');
const Battle = require('../game/battle');

let gameList = [];

const listGames = async () => {
	const finished = await Logger.listAll();

	const active = gameList.map((game) => game.log.get());

	return active.concat(finished);
};

const findGameById = (req) => gameList.find((battle) => battle.id === req.params.id);


const gameIndex = async (req, res) => {
	gameList = gameList.filter((game) => game.status !== 'finished');

	if (!gameList.some((game) => game.status === 'lobby')
	&& gameList.length < 5) {
		gameList.push(new Battle());
	}

	const results = await listGames();

	res.send(results);
};

const gameShow = async (req, res) => {
	const game = findGameById(req);

	if (game) return res.send(game.log.get());

	const log = await Logger.load(req.params.id);

	if (!log) return res.status(404).send({ error: 'Log not found' });

	res.send(log.get());
};

const addArmy = (req, res) => {
	const game = findGameById(req);

	if (!game) return res.status(404).send({ error: 'Game not found' });

	if (game.status !== 'lobby') return res.status(409).send({ error: 'This game is in progress/finished' });

	try {
		game.addArmy(req.body.name, req.body.units, req.body.strategy);
		res.send({ ok: 'Army added to the game' });
	} catch (error) {
		res.status(400).send({ error: 'Bad params' });
	}
};

const startGame = (req, res) => {
	const game = findGameById(req);

	if (!game) return res.status(404).send({ error: 'Game not found' });

	try {
		game.start();
	} catch (error) {
		return res.status(400).send({ error: 'Battle needs atleast 10 armies to start' });
	}

	res.send({ ok: 'Battle started' });
};

const resetGame = (req, res) => {
	const game = findGameById(req);

	game.reset();

	res.send({ ok: 'Game reseted' });
};

module.exports = {
	gameIndex,
	gameShow,
	addArmy,
	startGame,
	resetGame,
};
