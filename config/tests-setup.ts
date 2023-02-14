import {beforeEach, vi} from 'vitest';

import {
  MockAudioBuffer,
  MockAudioBufferSourceNode,
  MockAudioContext,
  MockAudioNode,
  MockAudioParam,
} from '../src/tests/mock';

// We may need to stub more globals as we encounter
// errors during testing.
vi.stubGlobal('AudioBuffer', MockAudioBuffer);
vi.stubGlobal('AudioBufferSourceNode', MockAudioBufferSourceNode);
vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('AudioNode', MockAudioNode);
vi.stubGlobal('AudioParam', MockAudioParam);

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
