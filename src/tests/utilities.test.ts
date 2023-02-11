import {describe, it, expect} from 'vitest';
import {clamp, progressPercentage, msToSec, secToMs} from '../utilities';

describe('Utilities', () => {
  describe('Numbers', () => {
    describe('clamp', () => {
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

    describe('progressPercentage', () => {
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
    describe('msToSec', () => {
      it('converts to seconds', () => {
        const result = msToSec(1234);
        expect(result).toBe(1.234);
      });
    });

    describe('secToMs', () => {
      it('converts to milliseconds', () => {
        const result = secToMs(5.678);
        expect(result).toBe(5678);
      });
    });
  });
});
