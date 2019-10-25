module.exports = class Battle {
  constructor() {
    this.armies = [];
  }

  addArmy(army) {
    this.uniqueName(army);

    this.armies.push(army);
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
    // setup listeners first
    this.armies.forEach((army) => {
      army.on('defeated', () => {
        this.defeat(army);
      });

      army.on('reloading', () => {
        console.log(`${army.name} reloading`);
        console.log('============');
      });

      army.on('reloaded', () => {
        this.attack(army);
      });
    });

    // add shuffle maybe?

    // start the attacks
    this.armies.forEach((army) => {
      this.attack(army);
    });
  }

  attack(army) {
    const opponent = this.setTarget(army);

    const damage = army.attack();

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
      console.log(`${this.armies[0].name} is the winner`);
    }
  }
};
