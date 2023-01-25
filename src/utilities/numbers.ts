interface ClampCriteria {
  preference: number;
  min: number;
  max: number;
}

export function clamp({preference, min, max}: ClampCriteria) {
  return Math.min(Math.max(min, preference), max);
}

export function progressPercentage(value: number, max: number) {
  return Math.floor((value / max) * 100);
}
