import {describe, it, expect, vi} from 'vitest';

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
    const testSound = new Sound(
      'TestInit',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('is initialized with default values', () => {
      expect(testSound).toBeInstanceOf(Sound);

      expect(testSound).toHaveProperty('volume', 1);
      expect(testSound).toHaveProperty('mute', false);
      expect(testSound).toHaveProperty('loop', false);
      expect(testSound).toHaveProperty('duration', 0);
      expect(testSound).toHaveProperty('state', 'created');
    });
  });

  // `mute` accessor is covered in `Abstract.test.ts`.
  // describe('mute', () => {});

  // `volume` accessor is covered in `Abstract.test.ts`.
  // describe('volume', () => {});

  describe('loop', () => {
    const testSound = new Sound(
      'TestLoop',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('allows `set` and `get`', () => {
      // TODO: Should check `AudioBufferSourceNode` value.
      expect(testSound.loop).toBe(false);
      testSound.loop = true;
      expect(testSound.loop).toBe(true);
    });
  });

  describe('duration', () => {
    const testSound = new Sound(
      'TestDuration',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('allows `get`', () => {
      // TODO: We should provide a buffer that has a `duration`.
      expect(testSound.duration).toBe(0);
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
      const testSound = new Sound(...mockConstructorArgs);
      const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

      expect(spySourceStart).not.toBeCalled();
      testSound.play();
      expect(spySourceStart).toBeCalledTimes(1);
    });

    it('does not call `start()` a 2nd time', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

      testSound.play().play().play();
      expect(spySourceStart).toBeCalledTimes(1);
    });

    it('unpauses the source', () => {
      const testSound = new Sound(...mockConstructorArgs);

      // TODO: Figure out how to check `#source` for `playbackRate.value`.
      expect(testSound.mute).toBe(false);
      testSound.play();
      expect(testSound.mute).toBe(false);
      testSound.pause();
      expect(testSound.mute).toBe(true);
      testSound.play();
      expect(testSound.mute).toBe(false);
    });

    it('updates state', () => {
      const testSound = new Sound(...mockConstructorArgs);

      testSound.play();
      expect(testSound.state).toBe('playing');
    });

    it('returns instance', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const instance = testSound.play();

      expect(instance).toBe(testSound);
    });
  });

  describe('pause()', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestPause',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    it('pauses the source', () => {
      const testSound = new Sound(...mockConstructorArgs);

      // TODO: Figure out how to check `#source` for `playbackRate.value`.
      testSound.play();
      expect(testSound.mute).toBe(false);
      testSound.pause();
      expect(testSound.mute).toBe(true);
    });

    it('updates state', () => {
      const testSound = new Sound(...mockConstructorArgs);

      testSound.play().pause();
      expect(testSound.state).toBe('paused');
    });

    // This condition is already covered in `events`.
    // it('does not update state again if already paused');

    it('returns instance', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const instance = testSound.play().pause();

      expect(instance).toBe(testSound);
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
      const testSound = new Sound(...mockConstructorArgs);
      const spySourceStop = vi.spyOn(AudioBufferSourceNode.prototype, 'stop');
      const spySourceDisconnect = vi.spyOn(
        AudioBufferSourceNode.prototype,
        'disconnect',
      );

      testSound.play();

      expect(spySourceStop).not.toBeCalled();
      expect(spySourceDisconnect).not.toBeCalled();
      testSound.stop();
      expect(spySourceStop).toBeCalledTimes(1);
      expect(spySourceDisconnect).toBeCalledTimes(1);
    });

    it('updates state', () => {
      const testSound = new Sound(...mockConstructorArgs);

      testSound.play().stop();
      expect(testSound.state).toBe('stopping');
    });

    it('empties active events', () => {
      const testSound = new Sound(...mockConstructorArgs);
      testSound.on('ended', vi.fn());

      // Unable to spy on private `empty()` method, so we
      // check against `activeEvents` instead.
      expect(testSound.activeEvents).toHaveLength(1);
      testSound.play().stop();
      expect(testSound.activeEvents).toHaveLength(0);
    });

    it('returns instance', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const instance = testSound.play().stop();

      expect(instance).toBe(testSound);
    });
  });

  // Some events are covered in other tests:
  // `volume` and `mute`.
  describe('events', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestEvents',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    it('emits an event for every state', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spyState: SoundEventMap['state'] = vi.fn((_current) => {});

      testSound.on('state', spyState);
      expect(spyState).not.toBeCalled();

      testSound.play();
      expect(spyState).toBeCalledWith('playing');

      testSound.pause();
      expect(spyState).toBeCalledWith('paused');

      testSound.stop();
      expect(spyState).toBeCalledWith('stopping');
    });

    it('does not emit redundant state changes', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spyState: SoundEventMap['state'] = vi.fn((_current) => {});

      testSound.on('state', spyState);

      testSound.play();
      expect(spyState).toBeCalledTimes(1);
      expect(spyState).toBeCalledWith('playing');

      testSound.pause();
      expect(spyState).toBeCalledTimes(2);
      expect(spyState).toBeCalledWith('paused');

      testSound.pause();
      expect(spyState).not.toBeCalledTimes(3);
    });

    it('emits `ended` event once sound has finished', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spyEnded: SoundEventMap['ended'] = vi.fn((_event) => {});

      testSound.on('ended', spyEnded);
      testSound.play();

      expect(spyEnded).not.toBeCalled();
      vi.advanceTimersToNextTimer();

      expect(spyEnded).toBeCalledWith({
        id: testSound.id,
        source: expect.any(AudioBufferSourceNode),
        neverStarted: false,
      });
    });

    it('emits `ended` event for a stopped sound that was never started', () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spyEnded: SoundEventMap['ended'] = vi.fn((_event) => {});

      testSound.on('ended', spyEnded);

      expect(spyEnded).not.toBeCalled();
      vi.advanceTimersToNextTimer();

      testSound.stop();

      expect(spyEnded).toBeCalledWith({
        id: testSound.id,
        source: expect.any(AudioBufferSourceNode),
        neverStarted: true,
      });
    });
  });
});
