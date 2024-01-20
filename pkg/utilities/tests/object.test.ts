import {describe, it, expect} from 'vitest';

import {objFilterNullish} from '../object';

describe('object utilities', () => {
  describe('objFilterNullish()', () => {
    it('returns an object with all null and undefined entries removed', async () => {
      const mockObj = {
        foo: 1,
        bar: 2,
        beef: true,
        chimi: false,
        ear: null,
        wurm: undefined,
        chicken: 0,
        friendship: Infinity,
      };

      const result = objFilterNullish(mockObj);

      expect(result).toStrictEqual({
        foo: 1,
        bar: 2,
        beef: true,
        chimi: false,
        chicken: 0,
        friendship: Infinity,
      });
    });
  });
});
