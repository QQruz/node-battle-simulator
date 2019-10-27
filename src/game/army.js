const EventEmitter = require('events');

module.exports = class Army extends EventEmitter {
	constructor(name, units, strategy) {
		super();
		this.name = name;
		this.parseUnits(units);
		this.parseStrategy(strategy);
		this.hp = 2 * this.units;
	}

	parseUnits(units) {
		const intUnits = parseInt(units, 10);

		if (!intUnits || (intUnits < 80 || intUnits > 100)) {
			throw new Error('Number of units must be beetween 80 and 100');
		}

		this.units = intUnits;
	}

	parseStrategy(strategy) {
		const allowedStrategies = ['random', 'strongest', 'weakest'];

		if (!allowedStrategies.includes(strategy)) {
			throw new Error(`Please chose one of the following strategies: ${allowedStrategies.toString()}`);
		}

		this.strategy = strategy;
	}

	attack() {
		// 0.5 damage per unit
		return this.isHit() ? this.units : 0;
	}

	isHit() {
		// 1% per unit
		return Math.floor(Math.random() * 100) <= this.units;
	}

	takeDamage(damage) {
		this.hp -= damage;
		this.units = Math.round(this.hp / 2);

		if (this.units <= 0) {
			this.emit('defeated');
		}
	}

	reload(time = null) {
		this.emit('reloading');

		const reloadTime = time || this.units * 10; // 0.01 second per unit

		setTimeout(() => {
			this.emit('reloaded');
		}, reloadTime);
	}

	setName(name) {
		this.name = name;
	}
};
