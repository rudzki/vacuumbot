// Roomba-like vacuum bot

let utils = require('./utils');
let decider = require('./decider');

let generateRandomSquare = () => {
  const squares = [' ', ' ', ' ', '*', '*', '#'];
  return utils.randomChoice(squares);
};

let generateRandomGrid = (sideLength = 10) => {
  const randomGrid = [];
  for (let i = 0; i < sideLength ** 2; i++) {
    if (i >= 0 && i < sideLength) randomGrid[i] = utils.toSymbol('obstacle');
    else if (i % sideLength === 0) randomGrid[i] = utils.toSymbol('obstacle');
    else if (i % sideLength === (sideLength - 1)) randomGrid[i] = utils.toSymbol('obstacle');
    else if (i > (sideLength ** 2) - sideLength && i < (sideLength ** 2)) randomGrid[i] = utils.toSymbol('obstacle');
    else randomGrid[i] = generateRandomSquare();
    if (i === Math.round(1.5 * sideLength)) randomGrid[i] = utils.toSymbol('vacuum');
  }
  return randomGrid;
}

function printGrid(grid, moves) {
  const area = grid.length;
  const sideLength = Math.round(Math.sqrt(area));
  let str = '';
  for (let i = 0; i < area; i++) {
    if ((i % sideLength === 0) && (i != 0)) {
      str += '\n';
    }
    str += grid[i];
  }
  return `\n${str}\n${moves || ''}`;
}

class Game {
  constructor(seedGrid) {
    this.moves = 0;
    this.grids = [];
    this.recentlyVisited = [];
    if (!seedGrid) seedGrid = generateRandomGrid();
    this.grids.push(seedGrid);
  }

  lookAroundVacuum() {
    const currentGrid = this.grids[this.grids.length - 1];
    const vacuumLocation = currentGrid.indexOf(utils.toSymbol('vacuum'));
    return {
      current: vacuumLocation,
      north: vacuumLocation - Math.round(Math.sqrt(currentGrid.length)),
      south: vacuumLocation + Math.round(Math.sqrt(currentGrid.length)),
      east: vacuumLocation + 1,
      west: vacuumLocation - 1,
    };
  }

  lookAround(index) {
    const currentGrid = this.grids[this.grids.length - 1];
    return {
      current: index,
      north: index - Math.round(Math.sqrt(currentGrid.length)),
      south: index + Math.round(Math.sqrt(currentGrid.length)),
      east: index + 1,
      west: index - 1,
    };
  }

  update(decision) {
    const currentGrid = this.grids[this.grids.length - 1];
    const nextGrid = [];
    for (let i = 0; i < currentGrid.length; i++) {
      nextGrid[i] = currentGrid[i];
    }
    const vacuumLocation = this.lookAroundVacuum().current;
    this.recentlyVisited.push(vacuumLocation);
    if (this.recentlyVisited.length > 10) {
      this.recentlyVisited.shift();
    }
    nextGrid[vacuumLocation] = utils.toSymbol('clean');
    nextGrid[decision] = utils.toSymbol('vacuum');
    return nextGrid;
  }

  next(print=true) {
    const currentGrid = this.grids[this.grids.length - 1];
    if (currentGrid.includes(utils.toSymbol('dirty'))) {
      const decision = decider.decider(this.lookAroundVacuum(), currentGrid, this.recentlyVisited);
      const update = this.update(decision);
      this.moves++;
      this.grids.push(update);
      return (print === false) ? true : printGrid(update, this.moves);
    }
    return (print === false) ? false : `All done in ${this.moves} moves!`;
  }
}

// Utilities for running trials

class Trial {
  constructor(game) {
    this.game = game;
    this.firstGrid = this.game.grids[0];
  }
  run() {
    while (true) {
      this.game.next(false);
      if (this.game.next(false) === false) break;
    }
    let totalMoves = this.game.moves;
    this.game = new Game(this.game.grids[0]);
    return totalMoves;
  }
  runTrials(numTrials) {
    let numMoves = [];
    for (let i = 0; i < numTrials; i++) {
      numMoves[i] = this.run(this.game);
    }
    let sumMoves = numMoves.reduce( (a,b) => a + b );
    return `
      Num Trials Requested: ${numTrials}
      Num Trials Completed: ${numMoves.length}
      ==
      Trial results: ${numMoves}
      Average moves to finish: ${sumMoves/numMoves.length}
    `;
  }
}


let game = new Game();

window.game = (function() {
  return function() { return game.next() };
})();
