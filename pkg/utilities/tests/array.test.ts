import {describe, it, expect} from 'vitest';

import {
  arrayDedupe,
  arrayOfLength,
  arrayShallowEquals,
  arrayShuffle,
  typedObjectKeys,
} from '../array';

describe('array utilities', () => {
  describe('arrayDedupe()', () => {
    it('removes duplicates within a single array', async () => {
      const result = arrayDedupe([1, 2, 3, 1, 2, 3]);
      expect(result).toStrictEqual([1, 2, 3]);
    });

    it('removes duplicates across multiple arrays', async () => {
      const result = arrayDedupe([1, 2, 3], [3, 2, 1], [4, 2, 0]);
      expect(result).toStrictEqual([1, 2, 3, 4, 0]);
    });
  });

  describe('arrayOfLength()', () => {
    it('returns an empty array by default', async () => {
      const result = arrayOfLength();
      expect(result).toStrictEqual([]);
    });

    it('returns an array of incremented index values', async () => {
      const mockLength = 6;
      const result = arrayOfLength(mockLength);

      expect(result).toStrictEqual([0, 1, 2, 3, 4, 5]);
      expect(result).toHaveLength(mockLength);
    });
  });

  describe('arrayShallowEquals()', () => {
    it('returns `true` when matching', async () => {
      const result = arrayShallowEquals(
        [true, false, null, undefined, 0, 1, 'end'],
        [true, false, null, undefined, 0, 1, 'end'],
      );
      expect(result).toBe(true);
    });

    it('returns `false` when at least one value is unmatched', async () => {
      const result = arrayShallowEquals([true, false], [false, true]);
      expect(result).toBe(false);
    });
  });

  describe('arrayShuffle()', () => {
    // Since the shuffle is randomized, it is possible that
    // this test could occasionally fail.
    it('returns a shuffled array with all equivalent values at difference indices', async () => {
      const original = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = arrayShuffle(original);

      expect([...original]).toStrictEqual(original);

      expect(result).not.toStrictEqual(original);
      expect(result).toHaveLength(original.length);

      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect(result.toSorted()).toStrictEqual(original);
    });
  });

  describe('typedObjectKeys()', () => {
    it('returns the equivalent of Object.keys()', async () => {
      const mockObj = {
        foo: 1,
        bar: 'two',
        beef: false,
        chimi: null,
        earwurm: undefined,
      };
      const result = typedObjectKeys(mockObj);

      expect(result).toStrictEqual(['foo', 'bar', 'beef', 'chimi', 'earwurm']);
      expect(result).toStrictEqual(Object.keys(mockObj));
    });
  });
});
