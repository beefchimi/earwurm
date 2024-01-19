import {describe, it, expect} from 'vitest';

import {msToSec, secToMs} from '../time';

describe('time utilities', () => {
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
