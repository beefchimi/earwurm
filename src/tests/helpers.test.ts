import {afterEach, describe, it, expect, vi} from 'vitest';

import {
  getErrorMessage,
  fetchAudioBuffer,
  scratchBuffer,
  unlockAudioContext,
} from '../helpers';
import {mockData, audioBufferSourceNodeEndedEvent} from './mock';

describe('Helpers', () => {
  const mockContext = new AudioContext();

  describe('getErrorMessage()', () => {
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

  describe('fetchAudioBuffer()', () => {
    it('throws parse Error on bogus path', async () => {
      const mockPath = './path/nowhere.webm';

      await expect(
        async () => await fetchAudioBuffer(mockPath, mockContext),
      ).rejects.toThrowError(`Failed to parse URL from ${mockPath}`);
    });

    it.todo('throws network error on bad response');

    // TODO: This test might fail locally...
    // We need to fix fetch requests in tests to mock a response.
    it('returns AudioBuffer', async () => {
      await expect(
        fetchAudioBuffer(mockData.audio, mockContext).catch((_error) => {}),
      ).resolves.toBeInstanceOf(AudioBuffer);
    });

    it.todo('passes custom options to fetch');
  });

  describe('scratchBuffer()', () => {
    it('creates a short silent AudioBuffer', () => {
      const result = scratchBuffer(mockContext);

      expect(result).toBeInstanceOf(AudioBuffer);

      expect(result).toHaveProperty('length', 1);
      expect(result).toHaveProperty('numberOfChannels', 1);
      expect(result).toHaveProperty('sampleRate', 22050);
    });
  });

  describe('unlockAudioContext()', () => {
    afterEach(() => {
      vi.advanceTimersToNextTimer();
    });

    it('resumes AudioContext state', () => {
      const spyCreateBuffer = vi.spyOn(mockContext, 'createBuffer');
      const spyResume = vi.spyOn(mockContext, 'resume');

      const spySourceConnect = vi.spyOn(
        AudioBufferSourceNode.prototype,
        'connect',
      );
      const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

      unlockAudioContext(mockContext);

      expect(spyCreateBuffer).toBeCalledTimes(1);
      expect(spyResume).not.toBeCalled();
      expect(spySourceConnect).not.toBeCalled();
      expect(spySourceStart).not.toBeCalled();

      // Unlocks upon any of these events:
      // `click`, `keydown`, `touchstart`, and `touchend`.
      const clickEvent = new Event('click');
      document.dispatchEvent(clickEvent);

      expect(spyResume).toBeCalledTimes(2);
      expect(spySourceConnect).toBeCalledWith(mockContext.destination);
      expect(spySourceStart).toBeCalledTimes(1);
    });

    it('calls onEnded after interaction event', () => {
      vi.spyOn(
        AudioBufferSourceNode.prototype,
        'addEventListener',
      ).mockImplementation(audioBufferSourceNodeEndedEvent);

      const mockEnded = vi.fn();
      const spySourceDisconnect = vi.spyOn(
        AudioBufferSourceNode.prototype,
        'disconnect',
      );

      unlockAudioContext(mockContext, mockEnded);

      expect(spySourceDisconnect).not.toBeCalled();
      expect(mockEnded).not.toBeCalled();

      const keydownEvent = new Event('keydown');
      document.dispatchEvent(keydownEvent);

      expect(spySourceDisconnect).toBeCalledTimes(1);
      expect(mockEnded).toBeCalledTimes(1);
    });
  });
});
