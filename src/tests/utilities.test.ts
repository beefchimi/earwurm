import {describe, it, expect} from 'vitest';
import {
  arrayOfLength,
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
  });

  describe('Numbers', () => {
    describe('clamp()', () => {
      it('returns preference', () => {
        const mockArgs = {
          preference: 10,
          min: 1,
          max: 100,
        };

        const result = clamp(mockArgs);

        expect(result).toBe(mockArgs.preference);
      });

      it('returns min', () => {
        const mockArgs = {
          preference: 1,
          min: 10,
          max: 100,
        };

        const result = clamp(mockArgs);

        expect(result).toBe(mockArgs.min);
      });

      it('returns max', () => {
        const mockArgs = {
          preference: 100,
          min: 1,
          max: 10,
        };

        const result = clamp(mockArgs);

        expect(result).toBe(mockArgs.max);
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
