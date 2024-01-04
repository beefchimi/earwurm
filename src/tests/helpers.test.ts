import {afterEach, describe, it, expect, vi} from 'vitest';

import {
  getErrorMessage,
  fetchAudioBuffer,
  linearRamp,
  scratchBuffer,
  unlockAudioContext,
} from '../helpers';
import {mockData, audioBufferSourceNodeEndedEvent} from './mock';

describe('Helpers', () => {
  const mockContext = new AudioContext();

  describe('getErrorMessage()', () => {
    it('returns message from basic object', async () => {
      const mockError = {
        message: 'foo',
      };

      const result = getErrorMessage(mockError);

      expect(result).toBe(mockError.message);
    });

    it('returns message from Error', async () => {
      const mockMessage = 'Foo';
      const mockError = new Error(mockMessage, {
        cause: 'bar',
      });

      const result = getErrorMessage(mockError);

      expect(result).toBe(mockMessage);
    });

    it('returns stringified result when unknown', async () => {
      const mockError = ['foo', true, {bar: false}, null];
      const result = getErrorMessage(mockError);

      expect(result).toBe(JSON.stringify(mockError));
    });
  });

  describe('fetchAudioBuffer()', () => {
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

  describe('linearRamp()', () => {
    it('transitions to the specified value', async () => {
      const mockAudioParam = new AudioParam();

      const spyCancel = vi.spyOn(mockAudioParam, 'cancelScheduledValues');
      const spySet = vi.spyOn(mockAudioParam, 'setValueAtTime');
      const spyRamp = vi.spyOn(mockAudioParam, 'linearRampToValueAtTime');

      const fromValue = mockAudioParam.value;
      const fromTime = mockContext.currentTime;

      const toValue = 2;
      const toTime = fromTime + 2;

      expect(spyCancel).not.toBeCalled();
      expect(spySet).not.toBeCalled();
      expect(spyRamp).not.toBeCalled();

      const result = linearRamp(
        mockAudioParam,
        {from: fromValue, to: toValue},
        {from: fromTime, to: toTime},
      );

      expect(result).toBeInstanceOf(AudioParam);

      expect(spyCancel).toBeCalledTimes(1);
      expect(spyCancel).toBeCalledWith(fromTime);

      expect(spySet).toBeCalledTimes(1);
      expect(spySet).toBeCalledWith(fromValue, fromTime);

      expect(spyRamp).toBeCalledTimes(1);
      expect(spyRamp).toBeCalledWith(toValue, toTime);
    });
  });

  describe('scratchBuffer()', () => {
    it('creates a short silent AudioBuffer', async () => {
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

    it('resumes AudioContext state', async () => {
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

    it('calls onEnded after interaction event', async () => {
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
