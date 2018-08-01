// Roomba-like vacuum bot

function randomChoice(array) {
  const randomIndex = Math.round(Math.random() * (array.length - 1));
  return array[randomIndex];
}

function generateRandomSquare() {
  const squares = [' ', ' ', ' ', '*', '*', '#'];
  return randomChoice(squares);
}

function toSymbol(state) {
  let symbol;
  if (state === 'clean') symbol = ' ';
  if (state === 'dirty') symbol = '*';
  if (state === 'obstacle') symbol = '#';
  if (state === 'vacuum') symbol = 'o';
  return symbol;
}

function generateRandomGrid(sideLength = 10) {
  const randomGrid = [];
  for (let i = 0; i < sideLength ** 2; i++) {
    if (i >= 0 && i < sideLength) randomGrid[i] = toSymbol('obstacle');
    else if (i % sideLength === 0) randomGrid[i] = toSymbol('obstacle');
    else if (i % sideLength === (sideLength - 1)) randomGrid[i] = toSymbol('obstacle');
    else if (i > (sideLength ** 2) - sideLength && i < (sideLength ** 2)) randomGrid[i] = toSymbol('obstacle');
    else randomGrid[i] = generateRandomSquare();
    if (i === Math.round(1.5 * sideLength)) randomGrid[i] = toSymbol('vacuum');
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
    const vacuumLocation = currentGrid.indexOf(toSymbol('vacuum'));
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

  decide() {
    // Input: Current Grid, vacuum and surrounding locations ;
    // Output: Number where vacuum should move to.
    const currentGrid = this.grids[this.grids.length - 1];
    const vacuumLocation = this.lookAroundVacuum().current;
    let surroundingVacuum = this.lookAroundVacuum();
    delete surroundingVacuum.current;

    surroundingVacuum = Object.values(surroundingVacuum);

    const clean = toSymbol('clean');
    const dirty = toSymbol('dirty');
    const obstacle = toSymbol('obstacle');

    const surroundingClean = surroundingVacuum.filter(
      pos => currentGrid[pos] === clean,
    );

    const notRecentlyVisited = list => list.filter(item => !this.recentlyVisited.includes(item));

    const surroundingDirty = surroundingVacuum.filter(
      pos => currentGrid[pos] === dirty,
    );
    return randomChoice(surroundingDirty)
            || randomChoice(notRecentlyVisited(surroundingClean))
            || randomChoice(surroundingClean)
            || vacuumLocation;
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
    nextGrid[vacuumLocation] = toSymbol('clean');
    nextGrid[decision] = toSymbol('vacuum');
    return nextGrid;
  }

  next(print=true) {
    const currentGrid = this.grids[this.grids.length - 1];
    if (currentGrid.includes(toSymbol('dirty'))) {
      const decision = this.decide();
      const update = this.update(decision);
      this.moves++;
      this.grids.push(update);
      if (print === false) return true;
      else return printGrid(update, this.moves);
    } else {
      if (print === false) return true;
      else return `All done in ${this.moves} moves!`;
    }
  }
}

let game = new Game();


// Utilities for running trials

class Trial {
  constructor(game) {
    this.game = game;
  }
  run() {
    while (true) {
      this.game.next(false);
      if (this.game.next(false) === false) break;
    }
    return this.game.moves;
  }
}

//   runTrials(numTrials) {
//     let numMoves = [];
//     for (let i = 0; i < numTrials; i++) {
//       numMoves[i] = this.run(this.game);
//     }
//     let sumMoves = numMoves.reduce( (a,b) => a + b );
//     return `
//       Num Trials Requested: ${numTrials}
//       Num Trials Completed: ${numMoves.length}
//       ==
//       Trial results: ${numMoves.toString()}
//       Average moves to finish: ${sumMoves/numMoves.length}
//     `;
//   }
// }
//
// let gameForTrial = new Game();
// let trial = new Trial(gameForTrial);
// console.log(trial.runTrials(2));
