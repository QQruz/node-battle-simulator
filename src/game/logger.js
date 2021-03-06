const { ObjectID } = require('mongodb');
const DB = require('../utils/db');

module.exports = class Logger {
  constructor() {
    this.log = {
      _id: new ObjectID(),
      status: null,
      armies: [],
      actions: [],
    };

    this.db = DB.get().collection('logs');
  }

  logAction(army, action, values = {}) {
    this.log.actions.push({
      time: Date.now(),
      army: {
        name: army.name,
        units: army.units,
        hp: army.hp,
      },
      action,
      ...values, // error?
    });
  }

  attack(attacker, opponent, damage) {
    this.logAction(attacker, 'attack', {
      opponent: {
        name: opponent.name,
        units: opponent.units,
        hp: opponent.hp,
      },
      damage,
    });
  }

  reloadStart(army) {
    this.logAction(army, 'reloadStart');
  }

  reloadEnd(army) {
    this.logAction(army, 'reloadEnd');
  }

  army(army) {
    this.log.armies.push({
      joined: Date.now(),
      name: army.name,
      units: army.units,
      hp: army.hp,
      strategy: army.strategy,
    });
  }

  status(status) {
    this.log.status = status;
  }

  get() {
    return this.log;
  }

  getId() {
    return this.log._id.toString();
  }

  async save() {
		await this.db.save(this.log);
  }
  
  static async load(id) {
    if (!ObjectID.isValid(id)) return null;
    
    const logger = new Logger();

    const log = await logger.db.findOne({ _id: ObjectID(id) });

    if (!log) return null;

    logger.log = log;

    return logger;
  }
  
  rewindTo(index) {
    if (index < 0 || index > this.log.actions.length) {
      throw new Error('Invalid index');
    }

    this.log.actions = this.log.actions.slice(0, index + 1);
  }

  static async listAll() {
    return await DB.get().collection('logs').find({}).project({ actions: false }).toArray();
  }

  static async loadInProgess() {
    const logs = await DB.get().collection('logs').find({ status: 'inProgress' }).toArray();

    return logs.map(log => {
      const logger = new Logger();
      logger.log = log;
      return logger;
    });
  }
};
