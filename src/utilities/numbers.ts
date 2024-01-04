export function assertNumber(value?: unknown): value is number {
  // Both `NaN` and `Infinity` are of type `number`,
  // but will not pass the `isFinite()` check.
  return typeof value === 'number' && isFinite(value);
}

export function clamp(min = 0, preference = 0.5, max = 1) {
  return Math.min(Math.max(min, preference), max);
}

export function progressPercentage(value = 0, max = 100) {
  const progress = Math.floor((value / max) * 100);
  return assertNumber(progress) ? progress : 0;
}
