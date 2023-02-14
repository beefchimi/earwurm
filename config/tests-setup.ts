import {beforeEach, vi} from 'vitest';

import {
  MockAudioBuffer,
  MockAudioBufferSourceNode,
  MockAudioContext,
} from '../src/tests/mock';

vi.stubGlobal('AudioBuffer', MockAudioBuffer);
vi.stubGlobal('AudioBufferSourceNode', MockAudioBufferSourceNode);
vi.stubGlobal('AudioContext', MockAudioContext);

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
