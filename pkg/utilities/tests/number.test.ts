import {describe, it, expect} from 'vitest';

import {
  assertNumber,
  assertInteger,
  assertFloat,
  clamp,
  calcProgress,
  flipNumberSign,
  roundNumber,
  trimDecimals,
} from '../number';

describe('number utilities', () => {
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

  describe('assertInteger()', () => {
    it('returns true when int', async () => {
      const result = assertInteger(123);
      expect(result).toBe(true);
    });

    it('returns false when float', async () => {
      const result = assertInteger(12.3);
      expect(result).toBe(false);
    });
  });

  describe('assertFloat()', () => {
    it('returns true when float', async () => {
      const result = assertFloat(12.3);
      expect(result).toBe(true);
    });

    it('returns false when int', async () => {
      const result = assertFloat(123);
      expect(result).toBe(false);
    });
  });

  describe('calcProgress()', () => {
    it('returns percentage integer', async () => {
      const result = calcProgress(10);
      expect(result).toBe(10);
    });

    it('returns floating-point result', async () => {
      const result = calcProgress(12, {max: 345});
      expect(result).toBe(3.4782608695652173);
    });

    it('returns rounded result', async () => {
      const result = calcProgress(12, {max: 345, round: true});
      expect(result).toBe(3);
    });

    it('returns percentage between min and max', async () => {
      const result = calcProgress(0, {min: -10, max: 10});
      expect(result).toBe(50);
    });

    it('protects against NaN', async () => {
      const result = calcProgress(0, {max: 0});
      expect(result).toBe(0);
    });

    it('protects against Infinity', async () => {
      const result = calcProgress(2, {max: 0});
      expect(result).toBe(0);
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

    it('protects against NaN', async () => {
      const result = clamp(1, NaN, 2);
      expect(result).toBe(0);
    });

    it('protects against Infinity', async () => {
      const result = clamp(Infinity, Infinity, Infinity);
      expect(result).toBe(0);
    });
  });

  describe('flipNumberSign()', () => {
    it('returns a negative number when provided a positive number', async () => {
      const result = flipNumberSign(123);
      expect(result).toBe(-123);
    });

    it('returns a positive number when provided a negative number', async () => {
      const result = flipNumberSign(-321);
      expect(result).toBe(321);
    });

    it('returns a positive 0', async () => {
      const result = flipNumberSign(-0);
      expect(result).toBe(0);
    });

    it('does not flip a positive 0 to negative', async () => {
      const result = flipNumberSign(0);
      expect(result).toBe(0);
    });
  });

  describe('roundNumber()', () => {
    it('returns an integer by default', async () => {
      const result = roundNumber(123.456);
      expect(result).toBe(123);
    });

    it('rounds to the specified decimal length', async () => {
      const result = roundNumber(1234.567, 2);
      expect(result).toBe(1234.57);
    });

    it('trims to the specified decimal length when rounding is not required', async () => {
      const result = roundNumber(9876.54321, 3);
      expect(result).toBe(9876.543);
    });

    it('does no additional rounding when not required', async () => {
      const result = roundNumber(654.321, 8);
      expect(result).toBe(654.321);
    });
  });

  describe('trimDecimals()', () => {
    it('returns an integer when there is nothing to trim', async () => {
      const result = trimDecimals(123);
      expect(result).toBe(123);
    });

    it('returns 2 decimal places by default', async () => {
      const result = trimDecimals(987.654321);
      expect(result).toBe(987.65);
    });

    it('returns the specified decimals', async () => {
      const result = trimDecimals(123.456789, 3);
      expect(result).toBe(123.456);
    });
  });
});
