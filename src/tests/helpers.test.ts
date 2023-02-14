import {beforeEach, afterEach, describe, it, expect, vi} from 'vitest';

import {
  getErrorMessage,
  fetchAudioBuffer,
  scratchBuffer,
  unlockAudioContext,
} from '../helpers';

import {
  audioBufferSourceNodeEndedEvent,
  MockAudioBuffer,
  MockAudioBufferSourceNode,
  MockAudioContext,
} from './mock';

vi.stubGlobal('AudioBuffer', MockAudioBuffer);
vi.stubGlobal('AudioBufferSourceNode', MockAudioBufferSourceNode);
vi.stubGlobal('AudioContext', MockAudioContext);

describe('Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

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
    const mockContext = new AudioContext();

    it('throws Error on bogus path', async () => {
      const mockPath = './path/nowhere.webm';
      const result = await fetchAudioBuffer(mockPath, mockContext);

      expect(result).toThrowError('something');
    });

    it.todo('returns ArrayBuffer');
  });

  describe('scratchBuffer', () => {
    const mockContext = new AudioContext();

    it('creates a short silent AudioBuffer', () => {
      const result = scratchBuffer(mockContext);

      expect(result).toBeInstanceOf(AudioBuffer);

      expect(result).toHaveProperty('length', 1);
      expect(result).toHaveProperty('numberOfChannels', 1);
      expect(result).toHaveProperty('sampleRate', 22050);
    });
  });

  describe('unlockAudioContext', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.advanceTimersToNextTimer();
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('resumes AudioContext state', () => {
      const mockContext = new AudioContext();

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
      const mockContext = new AudioContext();

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
