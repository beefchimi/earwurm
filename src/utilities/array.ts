export function arrayOfLength(length = 0): number[] {
  return Array.from(Array(length)).map((_item, index) => index);
}
