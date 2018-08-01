// Roomba-like vacuum bot

function randomChoice(array) {
    let randomIndex = Math.round(Math.random() * (array.length - 1));
    return array[randomIndex];
}

function generateRandomSquare() {
    let squares = [" ", " ", " ", "*", "*", "#"];
    return randomChoice(squares);
}

function toSymbol(state) {
    let symbol;
    if (state === "clean") symbol = " ";
    if (state === "dirty") symbol = "*";
    if (state === "obstacle") symbol = "#";
    if (state === "vacuum") symbol = "o";
    return symbol;
}

function generateRandomGrid(sideLength=10) {
        let randomGrid = [];
        for (let i = 0; i < sideLength ** 2; i++) {
            if (i >= 0 && i < sideLength) randomGrid[i] = toSymbol("obstacle");
            else if (i % sideLength === 0) randomGrid[i] = toSymbol("obstacle");
            else if (i % sideLength === (sideLength - 1)) randomGrid[i] = toSymbol("obstacle");
            else if (i > (sideLength ** 2) - sideLength && i < (sideLength ** 2)) randomGrid[i] = toSymbol("obstacle");
            else randomGrid[i] = generateRandomSquare();
            if (i === Math.round(1.5 * sideLength)) randomGrid[i] = toSymbol("vacuum");
        }
        return randomGrid;
}

function printGrid(grid, moves) {
    let area = grid.length;
    let sideLength = Math.round(Math.sqrt(area));
    let str = "";
    for (let i = 0; i < area; i++) {
        if ((i % sideLength === 0 ) && (i != 0)) {
            str += "\n";
        }
        str += grid[i];
    }
    return "\n" + str + "\n" + (moves ? moves : "");
}

class Game {
    constructor(seedGrid) {
        this.moves = 0;
        this.grids =[];
        this.visited = [];
        if (!seedGrid)
            seedGrid = generateRandomGrid();
        this.grids.push(seedGrid);
    }

    lookAroundVacuum() {
        let currentGrid = this.grids[this.grids.length - 1];
        let vacuumLocation = currentGrid.indexOf(toSymbol("vacuum"));
        return {
                current: vacuumLocation,
                north: vacuumLocation - Math.round(Math.sqrt(currentGrid.length)),
                south: vacuumLocation + Math.round(Math.sqrt(currentGrid.length)),
                east: vacuumLocation + 1,
                west: vacuumLocation - 1,
                };
    }

    lookAround(index) {
        let currentGrid = this.grids[this.grids.length - 1];
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
        let currentGrid = this.grids[this.grids.length - 1];
        let vacuumLocation = this.lookAroundVacuum().current;
        let surroundingVacuum = this.lookAroundVacuum();
        delete surroundingVacuum.current;

        surroundingVacuum = Object.values(surroundingVacuum);

        let clean = toSymbol("clean");
        let dirty = toSymbol("dirty");
        let obstacle = toSymbol("obstacle");

        let surroundingClean = surroundingVacuum.filter(
            pos => currentGrid[pos] === clean
        );

        let filterVisited = list => list.filter( item => !(this.visited.includes(item)));

        let surroundingDirty = surroundingVacuum.filter(
            pos => currentGrid[pos] === dirty
        );
        return randomChoice(surroundingDirty)
            || randomChoice(filterVisited(surroundingClean))
            || randomChoice(surroundingClean)
            || vacuumLocation;
    }
    update(decision) {
        let currentGrid = this.grids[this.grids.length - 1];
        let nextGrid = [];
        for (let i = 0; i < currentGrid.length; i++) {
            nextGrid[i] = currentGrid[i];
        }
        let vacuumLocation = this.lookAroundVacuum().current;
        this.visited.push(vacuumLocation);
        nextGrid[vacuumLocation] = toSymbol("clean");
        nextGrid[decision] = toSymbol("vacuum");
        return nextGrid;
    }
    next() {
        let currentGrid = this.grids[this.grids.length - 1];
        if (currentGrid.includes(toSymbol("dirty"))) {
            let decision = this.decide();
            let update = this.update(decision);
            this.moves++;
            this.grids.push(update);
            return printGrid(update, this.moves);
        } else {
            return `All clean in ${this.moves} moves!`;
        }
    }
}

let game = new Game();
