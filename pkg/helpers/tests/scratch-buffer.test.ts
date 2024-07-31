import {describe, expect, it} from 'vitest';

import {scratchBuffer} from '../scratch-buffer';

describe('scratchBuffer()', () => {
  const mockContext = new AudioContext();

  it('creates a short silent AudioBuffer', async () => {
    const result = scratchBuffer(mockContext);

    expect(result).toBeInstanceOf(AudioBuffer);

    expect(result).toHaveProperty('length', 1);
    expect(result).toHaveProperty('numberOfChannels', 1);
    expect(result).toHaveProperty('sampleRate', 22050);
  });
});
