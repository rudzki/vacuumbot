let randomChoice = array => {
  const randomIndex = Math.round(Math.random() * (array.length - 1));
  return array[randomIndex];
}

let toSymbol = state => {
  let symbol;
  if (state === 'clean') symbol = ' ';
  if (state === 'dirty') symbol = '*';
  if (state === 'obstacle') symbol = '#';
  if (state === 'vacuum') symbol = 'o';
  return symbol;
};

exports.randomChoice = randomChoice;
exports.toSymbol = toSymbol;
