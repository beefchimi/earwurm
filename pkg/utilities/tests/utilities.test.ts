import {describe, it, expect} from 'vitest';

import {arrayOfLength, arrayShallowEquals} from '../array';
import {assertNumber, clamp, progressPercentage} from '../number';
import {msToSec, secToMs} from '../time';

describe('Utilities', () => {
  describe('Array', () => {
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
  });

  describe('Numbers', () => {
    describe('assertNumber()', () => {
      it('accepts an integer', async () => {
        const result = assertNumber(123);
        expect(result).toBe(true);
      });

      it('accepts a float', async () => {
        const result = assertNumber(123.456);
        expect(result).toBe(true);
      });

      it('does not allow a bigint', async () => {
        const result = assertNumber(1000n);
        expect(result).toBe(false);
      });

      it('does not allow NaN', async () => {
        const result = assertNumber(NaN);
        expect(result).toBe(false);
      });

      it('does not allow Infinity', async () => {
        const result = assertNumber(Infinity);
        expect(result).toBe(false);
      });

      it('does not allow other non-numnber types', async () => {
        expect(assertNumber(true)).toBe(false);
        expect(assertNumber(false)).toBe(false);
        expect(assertNumber({one: 1})).toBe(false);
        expect(assertNumber([1, 2, 3])).toBe(false);
        expect(assertNumber('123')).toBe(false);
      });
    });

    describe('clamp()', () => {
      it('returns preference', async () => {
        const mockArgs: Parameters<typeof clamp> = [1, 10, 100];
        const result = clamp(...mockArgs);

        expect(result).toBe(10);
      });

      it('returns min', async () => {
        const mockArgs: Parameters<typeof clamp> = [10, 1, 100];
        const result = clamp(...mockArgs);

        expect(result).toBe(10);
      });

      it('returns max', async () => {
        const mockArgs: Parameters<typeof clamp> = [1, 100, 10];
        const result = clamp(...mockArgs);

        expect(result).toBe(10);
      });
    });

    describe('progressPercentage()', () => {
      it('returns percentage integer', async () => {
        const result = progressPercentage(6, 20);
        expect(result).toBe(30);
      });

      it('round down floating-point result', async () => {
        const result = progressPercentage(12, 345);
        // Before Math.floor(), result should be:
        // 3.4782608695652173
        expect(result).toBe(3);
      });

      it('protects against NaN', async () => {
        const result = progressPercentage(0, 0);
        expect(result).toBe(0);
      });

      it('protects against Infinity', async () => {
        const result = progressPercentage(2, 0);
        expect(result).toBe(0);
      });
    });
  });

  describe('Time', () => {
    describe('msToSec()', () => {
      it('converts to seconds', async () => {
        const result = msToSec(1234);
        expect(result).toBe(1.234);
      });
    });

    describe('secToMs()', () => {
      it('converts to milliseconds', async () => {
        const result = secToMs(5.678);
        expect(result).toBe(5678);
      });
    });
  });
});
