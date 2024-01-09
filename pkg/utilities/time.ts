const MS_PER_SEC = 1000;

export function msToSec(milliseconds: number) {
  return milliseconds / MS_PER_SEC;
}

export function secToMs(seconds: number) {
  return seconds * MS_PER_SEC;
}
