import {afterEach, describe, it, expect, vi} from 'vitest';

import {Sound} from '../Sound';
import {tokens} from '../tokens';
import type {SoundState, SoundEventMap} from '../types';

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

    it('is initialized with default values', async () => {
      expect(testSound).toBeInstanceOf(Sound);

      expect(testSound).toHaveProperty('volume', 1);
      expect(testSound).toHaveProperty('mute', false);
      expect(testSound).toHaveProperty('speed', 1);
      expect(testSound).toHaveProperty('loop', false);
      expect(testSound).toHaveProperty('duration', 0);
      expect(testSound).toHaveProperty('progress', {
        elapsed: 0,
        remaining: 0,
        percentage: 0,
        iterations: 0,
      });
      expect(testSound).toHaveProperty('state', 'created');
    });
  });

  // `mute` accessor is covered in `Abstract.test.ts`.
  // describe('mute', () => {});

  // `volume` accessor is covered in `Abstract.test.ts`.
  // describe('volume', () => {});

  describe('speed', () => {
    const testSound = new Sound(
      'TestSpeed',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    afterEach(() => {
      testSound.speed = 1;
    });

    it('allows `set` and `get`', async () => {
      const mockSpeed = 0.4;
      testSound.speed = mockSpeed;

      expect(testSound.speed).toBe(mockSpeed);
    });

    it('restricts value to a minimum of `0.25`', async () => {
      testSound.speed = -10;
      expect(testSound.speed).toBe(tokens.minSpeed);
    });

    it('restricts value to a maximum of `4`', async () => {
      testSound.speed = 10;
      expect(testSound.speed).toBe(tokens.maxSpeed);
    });

    // TODO: Not using `linearRamp` at the moment because:
    // 1. We are not usign "transitions" yet on `speed` change.
    // 2. FireFox seems to have a problem pausing after a
    //    `speed` change when using `linearRamp`. Likely due to
    //    either the same `to/from > currentTime` or no call to
    //    `cancelScheduledValues()` before setting `tokens.pauseSpeed`.
    it.skip('sets value on `playbackRate`', async () => {
      const oldValue = testSound.speed;
      const newValue = 2.2;

      const spySourceCancel = vi.spyOn(
        AudioParam.prototype,
        'cancelScheduledValues',
      );
      const spySourceSet = vi.spyOn(AudioParam.prototype, 'setValueAtTime');
      const spySourceRamp = vi.spyOn(
        AudioParam.prototype,
        'linearRampToValueAtTime',
      );

      const {currentTime} = defaultContext;
      testSound.play();

      // TODO: Spy on the `playbackRate.value` setter.
      // const spyPlaybackRateSet = vi.spyOn(AudioParam.prototype, 'value', 'set');
      testSound.speed = newValue;

      expect(spySourceCancel).toBeCalledWith(currentTime);
      expect(spySourceSet).toBeCalledWith(oldValue, currentTime);
      expect(spySourceRamp).toBeCalledWith(newValue, currentTime);
    });

    // TODO: Skipping for same reasons as above.
    it.skip('does not set value on playbackRate if paused', async () => {
      const {currentTime} = defaultContext;
      // TODO: This test should be changed to directly check that
      // the `AudioParam` has the expected `tokens` value.
      const spyRamp = vi.spyOn(AudioParam.prototype, 'linearRampToValueAtTime');

      testSound.play();
      expect(spyRamp).not.toBeCalled();

      testSound.speed = 1.23;
      expect(spyRamp).toBeCalledTimes(1);
      expect(spyRamp).toBeCalledWith(1.23, currentTime);

      testSound.pause();
      testSound.speed = 2.34;
      expect(spyRamp).not.toBeCalledTimes(2);

      testSound.play();
      testSound.speed = 3.45;
      expect(spyRamp).toBeCalledTimes(2);
      expect(spyRamp).toBeCalledWith(3.45, currentTime);
    });

    // TODO: Need to figure out how to spy on `playbackRate.value`.
    it.todo('sets value directly on AudioParam when not `paused` or `playing`');

    // TODO: Author this test if/when we support "transitions".
    it.todo('transitions to new speed');

    it('triggers speed event when set to a unique value', async () => {
      const spySpeed: SoundEventMap['speed'] = vi.fn((_rate) => {});

      testSound.on('speed', spySpeed);
      expect(spySpeed).not.toBeCalled();

      testSound.speed = 1;
      expect(spySpeed).not.toBeCalled();

      testSound.speed = 1.23;
      expect(spySpeed).toBeCalledWith(1.23);

      testSound.speed = 1.23;
      expect(spySpeed).not.toBeCalledTimes(2);

      testSound.off('speed', spySpeed);

      testSound.speed = 2.34;
      expect(spySpeed).not.toBeCalledWith(2.34);
    });
  });

  describe('loop', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestLoop',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    it('allows `set` and `get`', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      // TODO: Should check that `loop` is set on the source.
      // const spySourceNode = vi.spyOn(AudioBufferSourceNode.prototype, 'loop', 'set');

      expect(testSound.loop).toBe(false);
      testSound.loop = true;
      expect(testSound.loop).toBe(true);
    });

    it('does not repeat by default', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      expect(testSound.progress.iterations).toBe(0);
      testSound.play();
      vi.advanceTimersToNextTimer();
      expect(testSound.progress.iterations).toBe(0);
      vi.advanceTimersToNextTimer();
      expect(testSound.progress.iterations).toBe(0);
    });

    it('repeats sound indefinitely', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      expect(testSound.state).toBe('created');
      expect(testSound.progress.iterations).toBe(0);

      testSound.loop = true;
      testSound.play();

      expect(testSound.state).toBe('playing');
      vi.advanceTimersToNextTimer();
      expect(testSound.progress.iterations).toBe(1);
      vi.advanceTimersToNextTimer();
      expect(testSound.progress.iterations).toBe(2);

      // TODO: Test env seems to trigger `ended` even though
      // we are looping the Sound.
      // expect(testSound.state).toBe('playing');

      testSound.loop = false;
      vi.advanceTimersToNextTimer();
      // `iterations` does not increment a final time,
      // as it is only updated at the START of a new iteration.
      expect(testSound.progress.iterations).toBe(2);
      expect(testSound.state).toBe('ending');
    });
  });

  describe('duration', () => {
    const testSound = new Sound(
      'TestDuration',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    it('allows `get`', async () => {
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

    it('starts playing the source', async () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

      expect(spySourceStart).not.toBeCalled();
      testSound.play();
      expect(spySourceStart).toBeCalledTimes(1);
    });

    it('does not call `start()` a 2nd time', async () => {
      const testSound = new Sound(...mockConstructorArgs);
      const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

      testSound.play().play().play();
      expect(spySourceStart).toBeCalledTimes(1);
    });

    // TODO: Figure out how to directly test against
    // `AudioBufferSourceNode.playbackRate.value`.
    it.skip('unpauses the source', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      expect(testSound.speed).toBe(1);
      testSound.play();
      expect(testSound.speed).toBe(1);
      testSound.pause();
      expect(testSound.speed).toBe(tokens.pauseSpeed);
      testSound.play();
      expect(testSound.speed).toBe(1);
    });

    it('updates state', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      testSound.play();
      expect(testSound.state).toBe('playing');
    });

    it('returns instance', async () => {
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

    // TODO: Figure out how to directly test against
    // `AudioBufferSourceNode.playbackRate.value`.
    it.skip('pauses the source', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      testSound.play();
      expect(testSound.speed).toBe(1);
      testSound.pause();
      expect(testSound.speed).toBe(tokens.pauseSpeed);
    });

    it('updates state', async () => {
      const testSound = new Sound(...mockConstructorArgs);

      testSound.play().pause();
      expect(testSound.state).toBe('paused');
    });

    // This condition is already covered in `events`.
    // it('does not update state again if already paused');

    it('returns instance', async () => {
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

    it('stops and disconnects the source', async () => {
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

    it('emits the `stopping` state before `ending`', async () => {
      const testSound = new Sound(...mockConstructorArgs);
      const activeStates: SoundState[] = [];

      testSound.on('state', (current) => activeStates.push(current));

      expect(testSound.state).toBe('created');
      testSound.play().stop();
      expect(activeStates).toStrictEqual(['playing', 'stopping', 'ending']);
      expect(testSound.state).toBe('ending');
    });

    it('empties active events', async () => {
      const testSound = new Sound(...mockConstructorArgs);
      testSound.on('ended', vi.fn());

      // Unable to spy on private `empty()` method, so we
      // check against `activeEvents` instead.
      expect(testSound.activeEvents).toHaveLength(1);
      testSound.play().stop();
      expect(testSound.activeEvents).toHaveLength(0);
    });

    it('returns instance', async () => {
      const testSound = new Sound(...mockConstructorArgs);
      const instance = testSound.play().stop();

      expect(instance).toBe(testSound);
    });
  });

  // Some events are covered in other tests:
  // `volume`, `mute`, and `speed`.
  describe('events', () => {
    const mockConstructorArgs: SoundConstructor = [
      'TestEvents',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    ];

    describe('state', () => {
      it('emits for every change', async () => {
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

      it('does not emit redundant changes', async () => {
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
    });

    describe('ended', () => {
      it('emits once sound has finished', async () => {
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

      it('emits for a stopped sound that was never started', async () => {
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

    describe('progress', () => {
      it('emits for every animation frame', async () => {
        const testSound = new Sound(...mockConstructorArgs);
        const spyProgressEvent: SoundEventMap['progress'] = vi.fn(
          (_event) => {},
        );
        const spyGetProgress = vi.spyOn(Sound.prototype, 'progress', 'get');

        testSound.on('progress', spyProgressEvent);
        testSound.play();

        expect(spyProgressEvent).not.toBeCalled();
        expect(spyGetProgress).not.toBeCalled();
        vi.advanceTimersToNextTimer();

        // TODO: We will need to mock this test so that we can actually
        // increment `currentTime` against a playing Sound.
        expect(spyProgressEvent).toBeCalledTimes(1);
        expect(spyGetProgress).toBeCalledTimes(1);

        expect(spyProgressEvent).toBeCalledWith({
          elapsed: 0,
          remaining: 0,
          percentage: 0,
          iterations: 0,
        });
      });

      it('does not perform unneccessary calculations when there are no subscriptions', async () => {
        const testSound = new Sound(...mockConstructorArgs);
        const spyGetProgress = vi.spyOn(Sound.prototype, 'progress', 'get');

        testSound.play();
        vi.advanceTimersToNextTimer();

        expect(spyGetProgress).not.toBeCalled();
      });

      // TODO: This test needs to instead check against
      // `requestAnimationFrame()` never getting registered.
      // We actually do still `emit` at the end of `setState()`.
      it('does not emit events when subscribed after the sound has been started', async () => {
        const testSound = new Sound(...mockConstructorArgs);
        const spyProgressEvent: SoundEventMap['progress'] = vi.fn(
          (_event) => {},
        );

        testSound.play();
        vi.advanceTimersToNextTimer();
        testSound.on('progress', spyProgressEvent);

        expect(spyProgressEvent).not.toBeCalled();
      });

      // TODO: We need to correctly mock a sound's duration and playback.
      // This test should cover a combination of:
      // changing speeds during playback, looping, and pausing.
      it.todo('calculates progress values at various points in playback');
    });
  });
});
