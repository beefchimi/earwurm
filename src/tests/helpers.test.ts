import {describe, it, expect, vi} from 'vitest';

import {
  getErrorMessage,
  fetchAudioBuffer,
  scratchBuffer,
  unlockAudioContext,
} from '../helpers';
import {AudioContextMock} from './mock';

vi.stubGlobal('AudioContext', AudioContextMock);

describe('Helpers', () => {
  // TODO: Need to mock `AudioContext`.
  const mockAudioContext = new AudioContext();

  describe('getErrorMessage', () => {
    it('returns message from basic object', () => {
      const mockError = {
        message: 'foo',
      };

      const result = getErrorMessage(mockError);

      expect(result).toBe(mockError.message);
    });

    it('returns message from Error', () => {
      const mockMessage = 'Foo';
      const mockError = new Error(mockMessage, {
        cause: 'bar',
      });

      const result = getErrorMessage(mockError);

      expect(result).toBe(mockMessage);
    });

    it('returns stringified result when unknown', () => {
      const mockError = ['foo', true, {bar: false}, null];
      const result = getErrorMessage(mockError);

      expect(result).toBe(JSON.stringify(mockError));
    });
  });

  // TODO: Complete these tests
  describe.skip.concurrent('fetchAudioBuffer', () => {
    it('throws Error on bogus path', async () => {
      const mockPath = './path/nowhere.webm';
      const result = await fetchAudioBuffer(mockPath, mockAudioContext);

      expect(result).toThrowError('something');
    });

    it.todo('returns ArrayBuffer');
  });

  // TODO: Complete these tests
  describe.skip('scratchBuffer', () => {
    it('creates a short silent AudioBuffer', () => {
      const result = scratchBuffer(mockAudioContext);
      expect(result).toBeInstanceOf(AudioBuffer);
    });
  });

  // TODO: Complete these tests
  describe.skip('unlockAudioContext', () => {
    it('resumes AudioContext state', () => {
      expect(mockAudioContext.state).toBe('suspended');

      unlockAudioContext(mockAudioContext);

      // TODO: Simulate document click.
      expect(mockAudioContext.state).toBe('resumed');
    });

    it('calls onEnded after interaction event', () => {
      const mockEnded = vi.fn();

      unlockAudioContext(mockAudioContext, mockEnded);
      expect(mockEnded).not.toHaveBeenCalled();

      // TODO: Simulate document click.
      expect(mockEnded).toHaveBeenCalledTimes(1);
    });
  });
});
