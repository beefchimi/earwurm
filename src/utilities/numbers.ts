export function clamp(min = 0, preference = 0.5, max = 1) {
  return Math.min(Math.max(min, preference), max);
}

export function progressPercentage(value = 0, max = 100) {
  return Math.floor((value / max) * 100);
}
