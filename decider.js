let utils = require('./utils');

let decider = function(surroundingVacuum, currentGrid, recentlyVisited) {
  const vacuumLocation = surroundingVacuum.current;
  const clean = utils.toSymbol('clean');
  const dirty = utils.toSymbol('dirty');
  const obstacle = utils.toSymbol('obstacle');

  ///// BOT SETTING
  let bot = "aware";

  if (bot === "aware") {
    delete surroundingVacuum.current;
    surroundingVacuum = Object.values(surroundingVacuum);
    const surroundingClean = surroundingVacuum.filter(
      pos => currentGrid[pos] === clean,
    );
    const notRecentlyVisited = list => list.filter(item => !recentlyVisited.includes(item));
    const surroundingDirty = surroundingVacuum.filter(
      pos => currentGrid[pos] === dirty,
    );
    return utils.randomChoice(surroundingDirty)
            || utils.randomChoice(notRecentlyVisited(surroundingClean))
            || utils.randomChoice(surroundingClean)
            || vacuumLocation;

  } else if (bot === "simple") {
    delete surroundingVacuum.current;
    surroundingVacuum = Object.values(surroundingVacuum);
    surroundingVacuum = surroundingVacuum.filter(
      pos => currentGrid[pos] !== utils.toSymbol("obstacle")
    );
    return utils.randomChoice(surroundingVacuum);

  } else {
    throw error;
  }
};

exports.decider = decider;
