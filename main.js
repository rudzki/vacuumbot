// Roomba-like vacuum bot

function toSymbol(state) {
    let symbol;
    if (state === "clean") symbol = " ";
    if (state === "dirty") symbol = "*";
    if (state === "obstacle") symbol = "#";
    if (state === "vacuum") symbol = "o";
    return symbol;
}

function generateRandomSquare() {
    let squares = [" ", " "," ", " ", "*", "#"];
    let randomIndex = Math.round(Math.random() * (squares.length - 1));
    return squares[randomIndex];
}

function generateRandomGrid(sideLength=10) {
        let count = 0;
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
        //str += grid[i];
        if ((i % sideLength === 0 ) && (i != 0)) {
            str += "\n";
        }
        str += grid[i];
    }
    return "\n" + str + "\n" + moves;
}

class Game {
    constructor(seedGrid) {
        this.moves = 0;
        this.grids =[];
        if (seedGrid === undefined)
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
        let currentGrid = this.grids[this.grids.length - 1];
        let vacuumLocation = this.lookAroundVacuum().current;
        let surroundingLocations = this.lookAroundVacuum();
        let possibleDirections = this.lookAroundVacuum();
        delete possibleDirections.current;

        for (let location in surroundingLocations) {
            if (currentGrid[surroundingLocations[location]] === toSymbol("obstacle")) {
                delete possibleDirections[location];
            }
            if (currentGrid[surroundingLocations[location]] === toSymbol("dirty")) {
                return possibleDirections[location];
            }
        }
        let decision = Object.values(possibleDirections);
        if (Number.isInteger(decision)) {
            return decision;
        }
        //
        let filter = Math.round(Math.random() * (decision.length - 1));
        return decision[filter] || vacuumLocation;
    }

    update(decision) {
        let currentGrid = this.grids[this.grids.length - 1];
        let nextGrid = [];
        for (let i = 0; i < currentGrid.length; i++) {
            nextGrid[i] = currentGrid[i];
        }
        let vacuumLocation = this.lookAroundVacuum().current;
        nextGrid[vacuumLocation] = toSymbol("clean");
        nextGrid[decision] = toSymbol("vacuum");
        return nextGrid;
    }

    next() {
        let decision = this.decide();
        let update = this.update(decision);
        this.moves++;
        this.grids.push(update);
        return printGrid(update, this.moves);
    }
}









let seed = generateRandomGrid(10);
let game = new Game(seed);