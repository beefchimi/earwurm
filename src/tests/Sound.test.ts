import {beforeEach, afterEach, describe, it, expect, vi} from 'vitest';

import {Sound} from '../Sound';
import type {SoundEventMap} from '../types';

type SoundConstructor = ConstructorParameters<typeof Sound>;

describe('Sound component', () => {
  const defaultAudioBuffer = new AudioBuffer({
    length: 1,
    numberOfChannels: 2,
    sampleRate: 44100,
  });

  const defaultContext = new AudioContext();
  const defaultAudioNode = new AudioNode();

  describe('initialization', () => {
    const mockSound = new Sound(
      'TestInit',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('is initialized with default values', () => {
      expect(mockSound).toBeInstanceOf(Sound);

      expect(mockSound).toHaveProperty('volume', 1);
      expect(mockSound).toHaveProperty('mute', false);
      expect(mockSound).toHaveProperty('loop', false);
      expect(mockSound).toHaveProperty('duration', 0);
      expect(mockSound).toHaveProperty('state', 'created');
    });
  });

  // `mute` accessor is covered in `Abstract.test.ts`.
  // describe('mute', () => {});

  // `volume` accessor is covered in `Abstract.test.ts`.
  // describe('volume', () => {});

  describe('loop', () => {
    const mockSound = new Sound(
      'TestLoop',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('allows `set` and `get`', () => {
      // TODO: Should check `AudioBufferSourceNode` value.
      expect(mockSound.loop).toBe(false);
      mockSound.loop = true;
      expect(mockSound.loop).toBe(true);
    });
  });

  describe('duration', () => {
    const mockSound = new Sound(
      'TestDuration',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('allows `get`', () => {
      // TODO: We should provide a buffer that has a `duration`.
      expect(mockSound.duration).toBe(0);
    });
  });

  // `state` getter is covered in other tests.
  // describe('state', () => {});

  describe('play()', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestPlay',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    it('starts playing the source', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

      expect(spySourceStart).not.toBeCalled();
      mockSound.play();
      expect(spySourceStart).toBeCalledTimes(1);
    });

    it('updates state', () => {
      const mockSound = new Sound(...mockConstructorArgs);

      mockSound.play();
      expect(mockSound.state).toBe('playing');
    });

    it('returns instance', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const instance = mockSound.play();

      expect(instance).toBe(mockSound);
    });
  });

  describe('pause()', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestPause',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    // TODO: Figure out how to check `#source` for `playbackRate.value`.
    it.todo('pauses the source');

    it('updates state', () => {
      const mockSound = new Sound(...mockConstructorArgs);

      mockSound.play().pause();
      expect(mockSound.state).toBe('paused');
    });

    it('returns instance', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const instance = mockSound.play().pause();

      expect(instance).toBe(mockSound);
    });
  });

  describe('stop()', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestStop',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    it('stops and disconnects the source', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const spySourceStop = vi.spyOn(AudioBufferSourceNode.prototype, 'stop');
      const spySourceDisconnect = vi.spyOn(
        AudioBufferSourceNode.prototype,
        'disconnect',
      );

      mockSound.play();

      expect(spySourceStop).not.toBeCalled();
      expect(spySourceDisconnect).not.toBeCalled();
      mockSound.stop();
      expect(spySourceStop).toBeCalledTimes(1);
      expect(spySourceDisconnect).toBeCalledTimes(1);
    });

    it('updates state', () => {
      const mockSound = new Sound(...mockConstructorArgs);

      mockSound.play().stop();
      expect(mockSound.state).toBe('stopping');
    });

    it('empties active events', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      mockSound.on('ended', vi.fn());

      // Unable to spy on private `empty()` method, so we
      // check against `activeEvents` instead.
      expect(mockSound.activeEvents).toHaveLength(1);
      mockSound.play().stop();
      expect(mockSound.activeEvents).toHaveLength(0);
    });

    it('returns instance', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const instance = mockSound.play().stop();

      expect(instance).toBe(mockSound);
    });
  });

  describe('events', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    const mockConstructorArgs: SoundConstructor = [
      'TestEvents',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    it('emits an event for every statechange', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const spyStateChange: SoundEventMap['statechange'] = vi.fn(
        (_state) => {},
      );

      mockSound.on('statechange', spyStateChange);

      expect(spyStateChange).not.toBeCalled();

      mockSound.play();
      expect(spyStateChange).toBeCalledWith('playing');

      mockSound.pause();
      expect(spyStateChange).toBeCalledWith('paused');

      mockSound.stop();
      expect(spyStateChange).toBeCalledWith('stopping');
    });

    it('emits `ended` event once sound has finished', () => {
      const mockSound = new Sound(...mockConstructorArgs);
      const spyEnded: SoundEventMap['ended'] = vi.fn((_event) => {});

      mockSound.on('ended', spyEnded);
      mockSound.play();

      expect(spyEnded).not.toBeCalled();
      vi.advanceTimersToNextTimer();

      expect(spyEnded).toBeCalledWith({
        id: mockSound.id,
        source: expect.any(AudioBufferSourceNode),
      });
    });
  });
});
