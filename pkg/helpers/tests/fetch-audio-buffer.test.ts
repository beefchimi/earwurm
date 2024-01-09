import {describe, it, expect} from 'vitest';

import {mockData} from '../../mocks';
import {fetchAudioBuffer} from '../fetch-audio-buffer';

describe('fetchAudioBuffer()', () => {
  const mockContext = new AudioContext();

  it('throws parse Error on bogus path', async () => {
    const mockPath = './path/nowhere.webm';

    // This test used to check that the error was:
    // `Failed to parse URL from ${mockPath}`
    // However, we now get back a `[object Request]`,
    await expect(
      async () => await fetchAudioBuffer(mockPath, mockContext),
    ).rejects.toThrowError();
  });

  it.todo('throws network error on bad response');

  // TODO: Cannot test against `fetch()` until we correctly mock it.
  it.skip('returns AudioBuffer', async () => {
    await expect(
      fetchAudioBuffer(mockData.audio, mockContext).catch((_error) => {}),
    ).resolves.toBeInstanceOf(AudioBuffer);
  });

  it.todo('passes custom options to fetch');
});
