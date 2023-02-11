import {vi} from 'vitest';

export const AudioContextMock = vi.fn(() => ({
  currentTime: 0,
  destination: null,
  state: 'suspended',
  createGain: vi.fn(),
  createBuffer: vi.fn(),
  createBufferSource: vi.fn(),
  decodeAudioData: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  resume: vi.fn(),
  suspend: vi.fn(),
}));
