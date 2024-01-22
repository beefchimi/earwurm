import {describe, it, expect} from 'vitest';

import {supportDom, supportMatchMedia} from '../support';

describe('support utilities', () => {
  describe('supportDom()', () => {
    it('returns true in this test environment', async () => {
      const result = supportDom();
      expect(result).toBe(true);
    });
  });

  describe('supportMatchMedia()', () => {
    it('returns true in this test environment', async () => {
      const result = supportMatchMedia();
      expect(result).toBe(true);
    });
  });
});
