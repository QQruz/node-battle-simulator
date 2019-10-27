const Logger = require('../game/logger');
const Battle = require('../game/battle');

const findGameById = (req) => Battle.getRegistry().find((battle) => battle.id === req.params.id);


const gameIndex = async (req, res) => {
	if (!Battle.getRegistry().some((game) => game.status === 'lobby') && Battle.count() < 5) {
		const battle = new Battle();
	}

	const results = await Battle.listAll();

	return res.send(results);
};

const gameShow = async (req, res) => {
	const game = findGameById(req);

	if (game) {
		return res.send(game.log.get());
	}

	const log = await Logger.load(req.params.id);

	if (!log) {
		return res.status(404).send({ error: 'Log not found' });
	}

	return res.send(log.get());
};

const addArmy = (req, res) => {
	const game = findGameById(req);

	if (!game) {
		return res.status(404).send({ error: 'Game not found' });
	}

	if (game.status !== 'lobby') {
		return res.status(409).send({ error: 'This game is in progress/finished' });
	}

	try {
		game.addArmy(req.body.name, req.body.units, req.body.strategy);
		return res.send({ ok: 'Army added to the game' });
	} catch (error) {
		return res.status(400).send({ error: 'Bad params' });
	}
};

const startGame = (req, res) => {
	const game = findGameById(req);

	if (!game) {
		return res.status(404).send({ error: 'Game not found' });
	}

	try {
		game.start();
	} catch (error) {
		return res.status(400).send({ error: 'Battle needs atleast 10 armies to start' });
	}

	return res.send({ ok: 'Battle started' });
};

const resetGame = (req, res) => {
	const game = findGameById(req);

	if (!game) {
		return res.status(404).send('Game not found')
	}

	game.reset();

	res.send({ ok: 'Game reset' });
};

module.exports = {
	gameIndex,
	gameShow,
	addArmy,
	startGame,
	resetGame,
};
