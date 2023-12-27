import {describe, it, expect} from 'vitest';
import {
  arrayOfLength,
  arrayShallowEquals,
  assertNumber,
  clamp,
  progressPercentage,
  msToSec,
  secToMs,
} from '../utilities';

describe('Utilities', () => {
  describe('Array', () => {
    describe('arrayOfLength()', () => {
      it('returns an empty array by default', () => {
        const result = arrayOfLength();
        expect(result).toStrictEqual([]);
      });

      it('returns an array of incremented index values', () => {
        const mockLength = 6;
        const result = arrayOfLength(mockLength);

        expect(result).toStrictEqual([0, 1, 2, 3, 4, 5]);
        expect(result).toHaveLength(mockLength);
      });
    });

    describe('arrayShallowEquals()', () => {
      it('returns `true` when matching', () => {
        const result = arrayShallowEquals(
          [true, false, null, undefined, 0, 1, 'end'],
          [true, false, null, undefined, 0, 1, 'end'],
        );
        expect(result).toBe(true);
      });

      it('returns `false` when at least one value is unmatched', () => {
        const result = arrayShallowEquals([true, false], [false, true]);
        expect(result).toBe(false);
      });
    });
  });

  describe('Numbers', () => {
    describe('assertNumber()', () => {
      it('accepts an integer', () => {
        const result = assertNumber(123);
        expect(result).toBe(true);
      });

      it('accepts a float', () => {
        const result = assertNumber(123.456);
        expect(result).toBe(true);
      });

      it('does not allow a bigint', () => {
        const result = assertNumber(1000n);
        expect(result).toBe(false);
      });

      it('does not allow NaN', () => {
        const result = assertNumber(NaN);
        expect(result).toBe(false);
      });

      it('does not allow Infinity', () => {
        const result = assertNumber(Infinity);
        expect(result).toBe(false);
      });

      it('does not allow other non-numnber types', () => {
        expect(assertNumber(true)).toBe(false);
        expect(assertNumber(false)).toBe(false);
        expect(assertNumber({one: 1})).toBe(false);
        expect(assertNumber([1, 2, 3])).toBe(false);
        expect(assertNumber('123')).toBe(false);
      });
    });

    describe('clamp()', () => {
      it('returns preference', () => {
        const mockArgs: Parameters<typeof clamp> = [1, 10, 100];
        const result = clamp(...mockArgs);

        expect(result).toBe(10);
      });

      it('returns min', () => {
        const mockArgs: Parameters<typeof clamp> = [10, 1, 100];
        const result = clamp(...mockArgs);

        expect(result).toBe(10);
      });

      it('returns max', () => {
        const mockArgs: Parameters<typeof clamp> = [1, 100, 10];
        const result = clamp(...mockArgs);

        expect(result).toBe(10);
      });
    });

    describe('progressPercentage()', () => {
      it('returns percentage integer', () => {
        const result = progressPercentage(6, 20);
        expect(result).toBe(30);
      });

      it('round down floating-point result', () => {
        const result = progressPercentage(12, 345);
        // Before Math.floor(), result should be:
        // 3.4782608695652173
        expect(result).toBe(3);
      });

      it('protects against NaN', () => {
        const result = progressPercentage(0, 0);
        expect(result).toBe(0);
      });

      it('protects against Infinity', () => {
        const result = progressPercentage(2, 0);
        expect(result).toBe(0);
      });
    });
  });

  describe('Time', () => {
    describe('msToSec()', () => {
      it('converts to seconds', () => {
        const result = msToSec(1234);
        expect(result).toBe(1.234);
      });
    });

    describe('secToMs()', () => {
      it('converts to milliseconds', () => {
        const result = secToMs(5.678);
        expect(result).toBe(5678);
      });
    });
  });
});
