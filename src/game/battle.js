const Logger = require('./logger');
const Army = require('./army');

let registry = [];

module.exports = class Battle {
	constructor() {
		this.armies = [];

		this.log = new Logger();

		this.id = this.log.getId();

		this.setStatus('lobby');

		registry.push(this);
	}

	static getRegistry() {
		return registry;
	}

	static count() {
		return registry.length;
	}

	addArmy(name, units, strategy) {
		const army = new Army(name, units, strategy);

		this.uniqueName(army);

		this.armies.push(army);

		this.log.army(army);
	}

	// ensures that each army has unique name
	uniqueName(army) {
		let counter = 0;

		const { name } = army;

		while (this.armies.some((troops) => troops.name === army.name)) {
			counter += 1;
			army.setName(`${name}(${counter})`);
		}
	}

	start() {
		if (this.armies.length < 10) throw new Error('Battle needs atleast 10 armies to start');

		this.setStatus('inProgress');

		// setup listeners first
		this.addListeners();

		// add shuffle maybe?

		// start the attacks
		this.armies.forEach((army) => {
			this.attack(army);
		});
	}

	addListeners() {
		this.armies.forEach((army) => {
			army.on('defeated', () => {
				this.defeat(army);
			});

			army.on('reloading', () => {
				this.log.reloadStart(army);
				console.log(`${army.name} reloading`);
				console.log('============');
			});

			army.on('reloaded', () => {
				this.log.reloadEnd(army);
				this.attack(army);
			});
		});
	}

	attack(army) {
		const opponent = this.setTarget(army);

		const damage = army.attack();

		this.log.attack(army, opponent, damage);

		console.log(`${army.name} (${army.units}) attacks ${opponent.name} (${opponent.units}) for ${damage} damage`);
		console.log('============');

		opponent.takeDamage(damage);

		army.reload();
	}

	setTarget(attacker) {
		const opponents = this.armies.filter((army) => army !== attacker);

		if (attacker.strategy === 'weakest') {
			return opponents.reduce((prev, curr) => (prev.units <= curr.units ? prev : curr));
		}

		if (attacker.strategy === 'strongest') {
			return opponents.reduce((prev, curr) => (prev.units >= curr.units ? prev : curr));
		}

		return opponents[Math.floor(Math.random() * opponents.length)];
	}

	defeat(army) {
		army.removeAllListeners();

		this.armies = this.armies.filter((troops) => troops !== army);

		this.checkForWinner();
	}

	checkForWinner() {
		if (this.armies.length === 1) {
			this.armies[0].removeAllListeners();

			this.setStatus('finished');

			console.log(`${this.armies[0].name} is the winner`);

			registry = registry.filter((battle) => battle !== this);

			this.save()
				.then(() => {
					console.log(`${this.id} game saved`);
				})
				.catch((error) => {
					console.log(`Error saving game ${this.id}`);
					console.log(error);
				});
		}
	}

	setStatus(status) {
		this.status = status;

		this.log.status(status);
	}

	async save() {
		await this.log.save();
	}

	static async load(id, startAt = null) {
		const log = await Logger.load(id);

		return Battle.fromLog(log, startAt);
	}

	static fromLog(log, startAt = null) {
		const battle = new Battle();

		battle.log = log;

		battle.parseLog(startAt);

		return battle;
	}

	parseLog(startAt) {
		this.log.get().armies.forEach((army) => {
			this.armies.push(new Army(army.name, army.units, army.strategy));
		});

		this.addListeners();

		if (startAt) {
			this.log.rewindTo(startAt);
		}

		const lastActions = this.forwardGame();

		this.resume(lastActions);
	}

	forwardGame() {
		const lastActions = {};

		this.log.get().actions.forEach((action) => {
			lastActions[action.army.name] = action;

			if (action.action === 'attack') {
				const opponent = this.armies.find((army) => army.name === action.opponent.name);

				opponent.takeDamage(action.damage);
			}
		});

		return lastActions;
	}

	resume(lastActions) {
		this.id = this.log.getId();

		this.setStatus('inProgress');

		const lastLoggedTime = Object.values(lastActions).reduce((prev, curr) => (prev.time >= curr.time ? prev : curr)).time;

		this.armies.forEach((army) => {
			if (lastActions[army.name] && lastActions[army.name].action === 'attack') {
				army.reload();
			} else if (lastActions[army.name] && lastActions[army.name].action === 'reloadStart') {
				const timeLeft = lastLoggedTime - lastActions[army.name].time;

				army.reload(timeLeft);
			} else {
				this.attack(army);
			}
		});
	}

	reset() {
		this.armies.forEach((army) => {
			army.removeAllListeners();
		});

		this.armies = [];

		this.log.get().actions = [];

		this.log.get().armies.forEach((army) => {
			this.armies.push(new Army(army.name, army.units, army.strategy));
		});

		this.start();
	}

	static async listAll() {
		const logs = await Logger.listAll();

		const games = registry.map((game) => game.log.get());

		return games.concat(logs);
	}
};
