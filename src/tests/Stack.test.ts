import {describe, it, expect, vi} from 'vitest';

import {Stack} from '../Stack';
import {Sound} from '../Sound';
import {tokens} from '../tokens';
import {arrayOfLength} from '../utilities';
import type {StackEventMap, SoundEventMap} from '../types';
import {mockData} from './mock';

type StackConstructor = ConstructorParameters<typeof Stack>;

describe('Stack component', () => {
  const defaultContext = new AudioContext();
  const defaultAudioNode = new AudioNode();

  describe('initialization', () => {
    const testStack = new Stack(
      'TestInit',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    );

    it('is initialized with default values', () => {
      expect(testStack).toBeInstanceOf(Stack);

      // Class static properties
      expect(Stack).toHaveProperty('maxStackSize', tokens.maxStackSize);

      // Instance properties
      expect(testStack).toHaveProperty('volume', 1);
      expect(testStack).toHaveProperty('mute', false);
      expect(testStack).toHaveProperty('keys', []);
      expect(testStack).toHaveProperty('state', 'idle');
      expect(testStack).toHaveProperty('playing', false);
    });
  });

  // `mute` accessor is covered in `Abstract.test.ts`.
  // describe('mute', () => {});

  // `volume` accessor is covered in `Abstract.test.ts`.
  // describe('volume', () => {});

  describe('keys', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestKeys',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('contains ids of each unexpired Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const mockDurationHalf = Math.floor(mockData.playDurationMs / 2);
      const mockDurationQuarter = Math.floor(mockData.playDurationMs / 4);

      const sound1 = await testStack.prepare('One');
      const sound2 = await testStack.prepare('Two');
      const sound3 = await testStack.prepare('Three');

      sound1.play();
      vi.advanceTimersByTime(mockDurationQuarter);
      sound2.play();
      vi.advanceTimersByTime(mockDurationQuarter);
      sound3.play();

      expect(testStack.keys).toStrictEqual(['One', 'Two', 'Three']);
      vi.advanceTimersByTime(mockDurationHalf);
      expect(testStack.keys).toStrictEqual(['Two', 'Three']);
      vi.advanceTimersByTime(mockDurationQuarter);
      expect(testStack.keys).toStrictEqual(['Three']);
      vi.advanceTimersByTime(mockDurationQuarter);
      expect(testStack.keys).toStrictEqual([]);
    });
  });

  describe('state', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestState',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('triggers `statechange` event for every state', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const spyState: StackEventMap['statechange'] = vi.fn((_state) => {});

      testStack.on('statechange', spyState);

      expect(spyState).not.toBeCalled();
      expect(testStack.state).toBe('idle');

      const soundFoo = testStack.prepare('Foo');

      expect(spyState).toBeCalledWith('loading');
      await soundFoo.then((sound) => sound.play());

      expect(spyState).toBeCalledWith('playing');
      vi.advanceTimersToNextTimer();
      expect(spyState).toBeCalledWith('idle');

      // expect(spyState).toBeCalledTimes(3);
    });
  });

  describe('playing', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestPlaying',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('is `true` when any Sound is `playing`', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const sound = await testStack.prepare();

      expect(testStack.state).toBe('idle');
      expect(testStack.playing).toBe(false);

      sound.play();

      expect(testStack.state).toBe('playing');
      expect(testStack.playing).toBe(true);

      vi.advanceTimersByTime(mockData.playDurationMs);

      expect(testStack.state).toBe('idle');
      expect(testStack.playing).toBe(false);
    });
  });

  describe('get()', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestGet',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('returns `undefined` when there is no matching Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      await testStack.prepare('RealId');

      const requestedSound = testStack.get('FakeId');
      expect(requestedSound).toBe(undefined);
    });

    it('returns the requested Sound when present', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'RealId';
      const capturedSound = await testStack.prepare(mockSoundId);
      const requestedSound = testStack.get(mockSoundId);

      expect(requestedSound).toBeInstanceOf(Sound);
      expect(requestedSound).toBe(capturedSound);
    });
  });

  describe('has()', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestHas',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('returns `false` when there is no matching Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const hasSound = testStack.has('FakeId');
      expect(hasSound).toBe(false);
    });

    it('returns `true` when the requested Sound is present', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'RealId';
      await testStack.prepare(mockSoundId);
      const hasSound = testStack.has(mockSoundId);

      expect(hasSound).toBe(true);
    });
  });

  describe('pause()', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestPause',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('pauses and retains every Sound within the Stack', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const sound1 = await testStack.prepare('One');
      const sound2 = await testStack.prepare('Two');
      const sound3 = await testStack.prepare('Three');

      const spySound1Pause = vi.spyOn(sound1, 'pause');
      const spySound2Pause = vi.spyOn(sound2, 'pause');
      const spySound3Pause = vi.spyOn(sound3, 'pause');

      expect(testStack.state).toBe('idle');
      expect(testStack.keys).toHaveLength(3);

      sound1.play();
      sound2.play();
      sound3.play();

      expect(testStack.state).toBe('playing');
      testStack.pause();
      expect(testStack.state).toBe('idle');
      expect(testStack.keys).toHaveLength(3);

      expect(spySound1Pause).toBeCalled();
      expect(spySound2Pause).toBeCalled();
      expect(spySound3Pause).toBeCalled();
    });

    it('returns instance', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      await testStack.prepare('Foo');
      const instance = testStack.pause();

      expect(instance).toBe(testStack);
    });
  });

  describe('stop()', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestStop',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('stops and removes every Sound within the Stack', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const sound1 = await testStack.prepare('One');
      const sound2 = await testStack.prepare('Two');
      const sound3 = await testStack.prepare('Three');

      const spySound1Stop = vi.spyOn(sound1, 'stop');
      const spySound2Stop = vi.spyOn(sound2, 'stop');
      const spySound3Stop = vi.spyOn(sound3, 'stop');

      expect(testStack.state).toBe('idle');
      expect(testStack.keys).toHaveLength(3);

      sound1.play();
      sound2.play();
      sound3.play();

      expect(testStack.state).toBe('playing');
      testStack.stop();
      expect(testStack.state).toBe('idle');
      expect(testStack.keys).toHaveLength(0);

      expect(spySound1Stop).toBeCalled();
      expect(spySound2Stop).toBeCalled();
      expect(spySound3Stop).toBeCalled();
    });

    it('returns instance', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      await testStack.prepare('Foo');
      const instance = testStack.stop();

      expect(instance).toBe(testStack);
    });
  });

  describe('teardown()', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestTeardown',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('calls stop()', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const spyStop = vi.spyOn(testStack, 'stop');

      expect(spyStop).not.toBeCalled();
      testStack.teardown();
      expect(spyStop).toBeCalledTimes(1);
    });

    it('empties all active events', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      testStack.on('error', vi.fn());
      testStack.on('statechange', vi.fn());

      expect(testStack.activeEvents).toHaveLength(2);
      testStack.teardown();
      expect(testStack.activeEvents).toHaveLength(0);
    });

    it('returns instance', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      await testStack.prepare('Foo');
      const instance = testStack.stop();

      expect(instance).toBe(testStack);
    });
  });

  describe('prepare()', () => {
    const mockStackId = 'TestPrepare';
    const mockConstructorArgs: StackConstructor = [
      mockStackId,
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('auto-assigns an id when none is provided', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      await testStack.prepare();
      await testStack.prepare();
      await testStack.prepare();

      expect(testStack.keys).toStrictEqual([
        `${mockStackId}-1`,
        `${mockStackId}-2`,
        `${mockStackId}-3`,
      ]);
    });

    it('assigns the provided id and continues to increment internal counter', async () => {
      const mockSoundId1 = 'Foo';
      const mockSoundId3 = 'Bar';
      const testStack = new Stack(...mockConstructorArgs);

      await testStack.prepare(mockSoundId1);
      await testStack.prepare();
      await testStack.prepare(mockSoundId3);
      await testStack.prepare();

      expect(testStack.keys).toStrictEqual([
        mockSoundId1,
        `${mockStackId}-2`,
        mockSoundId3,
        `${mockStackId}-4`,
      ]);
    });

    it('returns a Promise containing the newly created Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const mockSoundId = 'Foo';
      const sound = testStack.prepare(mockSoundId);

      expect(sound).toBeInstanceOf(Promise);
      await expect(sound).resolves.toBeInstanceOf(Sound);
      await expect(sound).resolves.toHaveProperty('id', mockSoundId);
    });
  });

  describe('#load()', () => {
    const mockConstructorArgs: StackConstructor = [
      'TestLoad',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    ];

    it('sets state to `loading` until fetch is resolved', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const sound = testStack.prepare();

      expect(testStack.state).toBe('loading');
      await sound;
      expect(testStack.state).toBe('idle');
    });

    it('returns state to `playing` if a Sound was already playing', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      expect(testStack.state).toBe('idle');
      await testStack.prepare().then((sound) => sound.play());
      expect(testStack.state).toBe('playing');

      const unplayedSound = testStack.prepare();

      expect(testStack.state).toBe('loading');
      await unplayedSound;
      expect(testStack.state).toBe('playing');
    });

    it.todo('passes `request` to `fetchAudioBuffer`');

    it('emits error when encountered', async () => {
      const mockStackId = 'TestLoadFail';
      const mockPath = 'fake/path/file.mp3';

      const testStack = new Stack(
        mockStackId,
        mockPath,
        defaultContext,
        defaultAudioNode,
      );

      const spyError: StackEventMap['error'] = vi.fn((_error) => {});

      testStack.on('error', spyError);
      await testStack.prepare();

      expect(spyError).toBeCalledWith({
        id: mockStackId,
        message: [
          `Failed to load: ${mockPath}`,
          expect.stringContaining(mockPath),
        ],
      });
    });

    it('returns scratchBuffer on error', async () => {
      const testStack = new Stack(
        'TestLoadScratch',
        'path/to/no/where.webm',
        defaultContext,
        defaultAudioNode,
      );

      const scratchSound = await testStack.prepare();
      const scratchBuffer = scratchSound.buffer;

      expect(scratchBuffer).toBeInstanceOf(AudioBuffer);
      expect({...scratchBuffer}).toStrictEqual({
        duration: 0,
        length: 1,
        numberOfChannels: 1,
        sampleRate: 22050,
      });
    });
  });

  describe('#create()', () => {
    const mockStackId = 'TestCreate';
    const mockFadeMs = 8;

    const mockConstructorArgs: StackConstructor = [
      mockStackId,
      mockData.audio,
      defaultContext,
      defaultAudioNode,
      {fadeMs: mockFadeMs},
    ];

    it('constructs Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'Foo';
      const sound = await testStack.prepare(mockSoundId);

      expect(sound).toHaveProperty('id', mockSoundId);

      // TODO: Fix fetch requests in test. We need to mock a response.
      expect(sound).toHaveProperty('buffer', {
        duration: 0,
        length: 1,

        // Until we can mock fetch requests,
        // we end up with a scratch buffer.
        numberOfChannels: 1,
        sampleRate: 22050,

        // numberOfChannels: 2,
        // sampleRate: 44100,
      });
      expect(sound).toHaveProperty('context', defaultContext);

      // TODO: Would be ideal to spy on the `Sound` constructor and
      // assert that it has been called with the expected parameters.

      // We still need to test for `options`.
      // expect(sound).toHaveProperty('options.fadeMs', mockFadeMs);
    });

    it('registers `statechange` multi-listener on Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const sound = await testStack.prepare();

      sound.play().pause();
      expect(sound.activeEvents).toContain('statechange');
    });

    it('registers `ended` single-listener on Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const sound = await testStack.prepare();

      sound.play();
      // No way to really check that the event is removed,
      // since the Sound is removed from the Stack upon `ended`.
      expect(sound.activeEvents).toContain('ended');
    });

    it('expires old sounds that fall outside of the `maxStackSize`', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const spyEnded: SoundEventMap['ended'] = vi.fn((_ended) => {});

      // Fill the `queue` up with the exact max number of Sounds.
      const pendingSounds = arrayOfLength(Stack.maxStackSize).map(
        async (_index) => await testStack.prepare(),
      );

      const sounds = await Promise.all(pendingSounds);
      const additionalSoundsCount = Math.floor(Stack.maxStackSize / 2);

      sounds.forEach((sound) => {
        // We won't know what the exactly order of Sounds will be,
        // so we will apply the `ended` listener to everything.
        sound.once('ended', spyEnded);
        sound.play();
      });

      // Order will be different because of `async` Sound creation,
      // but `strictEqual` comparison doesn't care about order.
      expect(testStack.keys).toStrictEqual([
        `${mockStackId}-1`,
        `${mockStackId}-2`,
        `${mockStackId}-3`,
        `${mockStackId}-4`,
        `${mockStackId}-5`,
        `${mockStackId}-6`,
        `${mockStackId}-7`,
        `${mockStackId}-8`,
      ]);
      expect(spyEnded).not.toBeCalled();

      // Add more sounds before any current Sound has finished playing.
      const additionalSounds = arrayOfLength(additionalSoundsCount).map(
        async (_index) => await testStack.prepare(),
      );

      await Promise.all(additionalSounds);

      expect(testStack.keys).toHaveLength(Stack.maxStackSize);
      expect(spyEnded).toBeCalledTimes(additionalSoundsCount);
    });
  });

  // Both `statechange` and `error` are covered in other tests.
  // describe('events', () => {});
});
