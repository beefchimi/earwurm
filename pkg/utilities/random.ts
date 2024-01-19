export function randomFloat(min = 0, max = 1) {
  const random = Math.random() * (max - min) + min;
  return Math.min(random, max);
}

export function randomInteger(min = 0, max = 1) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);

  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export function randomBoolean() {
  return Boolean(randomInteger());
}
