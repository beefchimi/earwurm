import {describe, it, expect, vi} from 'vitest';

import {Stack} from '../Stack';
import {Sound} from '../Sound';
import {tokens} from '../tokens';
import type {StackEventMap, SoundEventMap} from '../types';
import {mockData} from './mock';

type StackConstructor = ConstructorParameters<typeof Stack>;

describe('Stack component', () => {
  const defaultContext = new AudioContext();
  const defaultAudioNode = new AudioNode();

  describe('initialization', () => {
    const mockStack = new Stack(
      'TestInit',
      mockData.audio,
      defaultContext,
      defaultAudioNode,
    );

    it('is initialized with default values', () => {
      expect(mockStack).toBeInstanceOf(Stack);

      // Class static properties
      expect(Stack).toHaveProperty('maxStackSize', tokens.maxStackSize);

      // Instance properties
      expect(mockStack).toHaveProperty('volume', 1);
      expect(mockStack).toHaveProperty('mute', false);
      expect(mockStack).toHaveProperty('keys', []);
      expect(mockStack).toHaveProperty('state', 'idle');
      expect(mockStack).toHaveProperty('playing', false);
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
      const mockStack = new Stack(...mockConstructorArgs);

      const sound1 = await mockStack.prepare('One');
      const sound2 = await mockStack.prepare('Two');
      const sound3 = await mockStack.prepare('Three');

      sound1.play();
      vi.advanceTimersByTime(4);
      sound2.play();
      vi.advanceTimersByTime(4);
      sound3.play();

      expect(mockStack.keys).toStrictEqual(['One', 'Two', 'Three']);
      vi.advanceTimersByTime(2);
      expect(mockStack.keys).toStrictEqual(['Two', 'Three']);
      vi.advanceTimersByTime(4);
      expect(mockStack.keys).toStrictEqual(['Three']);
      vi.advanceTimersByTime(4);
      expect(mockStack.keys).toStrictEqual([]);
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
      const mockStack = new Stack(...mockConstructorArgs);
      const spyState: StackEventMap['statechange'] = vi.fn((_state) => {});

      mockStack.on('statechange', spyState);

      expect(spyState).not.toBeCalled();
      expect(mockStack.state).toBe('idle');

      const soundFoo = mockStack.prepare('Foo');

      expect(spyState).toBeCalledWith('loading');
      await soundFoo.then((sound) => sound.play());

      expect(spyState).toBeCalledWith('playing');
      vi.advanceTimersToNextTimer();
      expect(spyState).toBeCalledWith('idle');
      expect(spyState).toBeCalledTimes(3);
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
      const mockStack = new Stack(...mockConstructorArgs);
      const sound = await mockStack.prepare();

      expect(mockStack.playing).toBe(false);
      sound.play();
      expect(mockStack.playing).toBe(true);
      vi.advanceTimersByTime(10);
      expect(mockStack.playing).toBe(false);
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
      const mockStack = new Stack(...mockConstructorArgs);
      await mockStack.prepare('RealId');

      const requestedSound = mockStack.get('FakeId');
      expect(requestedSound).toBe(undefined);
    });

    it('returns the requested Sound when present', async () => {
      const mockStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'RealId';
      const capturedSound = await mockStack.prepare(mockSoundId);
      const requestedSound = mockStack.get(mockSoundId);

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
      const mockStack = new Stack(...mockConstructorArgs);
      const hasSound = mockStack.has('FakeId');
      expect(hasSound).toBe(false);
    });

    it('returns `true` when the requested Sound is present', async () => {
      const mockStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'RealId';
      await mockStack.prepare(mockSoundId);
      const hasSound = mockStack.has(mockSoundId);

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
      const mockStack = new Stack(...mockConstructorArgs);

      const sound1 = await mockStack.prepare('One');
      const sound2 = await mockStack.prepare('Two');
      const sound3 = await mockStack.prepare('Three');

      const spySound1Pause = vi.spyOn(sound1, 'pause');
      const spySound2Pause = vi.spyOn(sound2, 'pause');
      const spySound3Pause = vi.spyOn(sound3, 'pause');

      expect(mockStack.state).toBe('idle');
      expect(mockStack.keys).toHaveLength(3);

      sound1.play();
      sound2.play();
      sound3.play();

      expect(mockStack.state).toBe('playing');
      mockStack.pause();
      expect(mockStack.state).toBe('idle');
      expect(mockStack.keys).toHaveLength(3);

      expect(spySound1Pause).toBeCalled();
      expect(spySound2Pause).toBeCalled();
      expect(spySound3Pause).toBeCalled();
    });

    it('returns instance', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      await mockStack.prepare('Foo');
      const instance = mockStack.pause();

      expect(instance).toBe(mockStack);
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
      const mockStack = new Stack(...mockConstructorArgs);

      const sound1 = await mockStack.prepare('One');
      const sound2 = await mockStack.prepare('Two');
      const sound3 = await mockStack.prepare('Three');

      const spySound1Stop = vi.spyOn(sound1, 'stop');
      const spySound2Stop = vi.spyOn(sound2, 'stop');
      const spySound3Stop = vi.spyOn(sound3, 'stop');

      expect(mockStack.state).toBe('idle');
      expect(mockStack.keys).toHaveLength(3);

      sound1.play();
      sound2.play();
      sound3.play();

      expect(mockStack.state).toBe('playing');
      mockStack.stop();
      expect(mockStack.state).toBe('idle');
      expect(mockStack.keys).toHaveLength(0);

      expect(spySound1Stop).toBeCalled();
      expect(spySound2Stop).toBeCalled();
      expect(spySound3Stop).toBeCalled();
    });

    it('returns instance', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      await mockStack.prepare('Foo');
      const instance = mockStack.stop();

      expect(instance).toBe(mockStack);
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
      const mockStack = new Stack(...mockConstructorArgs);
      const spyStop = vi.spyOn(mockStack, 'stop');

      expect(spyStop).not.toBeCalled();
      mockStack.teardown();
      expect(spyStop).toBeCalledTimes(1);
    });

    it('empties all active events', async () => {
      const mockStack = new Stack(...mockConstructorArgs);

      mockStack.on('error', vi.fn());
      mockStack.on('statechange', vi.fn());

      expect(mockStack.activeEvents).toHaveLength(2);
      mockStack.teardown();
      expect(mockStack.activeEvents).toHaveLength(0);
    });

    it('returns instance', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      await mockStack.prepare('Foo');
      const instance = mockStack.stop();

      expect(instance).toBe(mockStack);
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
      const mockStack = new Stack(...mockConstructorArgs);

      await mockStack.prepare();
      await mockStack.prepare();
      await mockStack.prepare();

      expect(mockStack.keys).toStrictEqual([
        `${mockStackId}-1`,
        `${mockStackId}-2`,
        `${mockStackId}-3`,
      ]);
    });

    it('assigns the provided id and continues to increment internal counter', async () => {
      const mockSoundId1 = 'Foo';
      const mockSoundId3 = 'Bar';
      const mockStack = new Stack(...mockConstructorArgs);

      await mockStack.prepare(mockSoundId1);
      await mockStack.prepare();
      await mockStack.prepare(mockSoundId3);
      await mockStack.prepare();

      expect(mockStack.keys).toStrictEqual([
        mockSoundId1,
        `${mockStackId}-2`,
        mockSoundId3,
        `${mockStackId}-4`,
      ]);
    });

    it('returns a Promise containing the newly created Sound', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      const mockSoundId = 'Foo';
      const sound = mockStack.prepare(mockSoundId);

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
      const mockStack = new Stack(...mockConstructorArgs);
      const sound = mockStack.prepare();

      expect(mockStack.state).toBe('loading');
      await sound;
      expect(mockStack.state).toBe('idle');
    });

    it('returns state to `playing` if a Sound was already playing', async () => {
      const mockStack = new Stack(...mockConstructorArgs);

      expect(mockStack.state).toBe('idle');
      await mockStack.prepare().then((sound) => sound.play());
      expect(mockStack.state).toBe('playing');

      const unplayedSound = mockStack.prepare();

      expect(mockStack.state).toBe('loading');
      await unplayedSound;
      expect(mockStack.state).toBe('playing');
    });

    it('emits error when encountered', async () => {
      const mockStackId = 'TestLoadFail';
      const mockPath = 'fake/path/file.mp3';

      const mockStack = new Stack(
        mockStackId,
        mockPath,
        defaultContext,
        defaultAudioNode,
      );

      const spyError: StackEventMap['error'] = vi.fn((_error) => {});

      mockStack.on('error', spyError);
      await mockStack.prepare();

      expect(spyError).toBeCalledWith({
        id: mockStackId,
        message: [
          `Failed to load: ${mockPath}`,
          expect.stringContaining(mockPath),
        ],
      });
    });

    it('returns scratchBuffer on error', async () => {
      const mockStack = new Stack(
        'TestLoadScratch',
        'path/to/no/where.webm',
        defaultContext,
        defaultAudioNode,
      );

      const scratchSound = await mockStack.prepare();
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

    function arrayOfLength(length: number) {
      return Array.from(Array(length));
    }

    it('constructs Sound', async () => {
      const mockStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'Foo';
      const sound = await mockStack.prepare(mockSoundId);

      expect(sound).toHaveProperty('id', mockSoundId);
      expect(sound).toHaveProperty('buffer', {
        duration: 0,
        length: 1,
        numberOfChannels: 2,
        sampleRate: 44100,
      });
      expect(sound).toHaveProperty('context', defaultContext);

      // TODO: Would be ideal to spy on the `Sound` constructor and
      // assert that it has been called with the expected parameters.

      // We still need to test for `options`.
      // expect(sound).toHaveProperty('options.fadeMs', mockFadeMs);
    });

    it('registers `statechange` multi-listener on Sound', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      const sound = await mockStack.prepare();

      sound.play().pause();
      expect(sound.activeEvents).toContain('statechange');
    });

    it('registers `ended` single-listener on Sound', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      const sound = await mockStack.prepare();

      sound.play();
      // No way to really check that the event is removed,
      // since the Sound is removed from the Stack upon `ended`.
      expect(sound.activeEvents).toContain('ended');
    });

    it('expires old sounds that fall outside of the `maxStackSize`', async () => {
      const mockStack = new Stack(...mockConstructorArgs);
      const spyEnded: SoundEventMap['ended'] = vi.fn((_ended) => {});

      // Fill the `queue` up with the exact max number of Sounds.
      const pendingSounds = arrayOfLength(Stack.maxStackSize).map(
        async () => await mockStack.prepare(),
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
      expect(mockStack.keys).toStrictEqual([
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
        async () => await mockStack.prepare(),
      );

      await Promise.all(additionalSounds);

      expect(mockStack.keys).toHaveLength(Stack.maxStackSize);
      expect(spyEnded).toBeCalledTimes(additionalSoundsCount);
    });
  });

  // Both `statechange` and `error` are covered in other tests.
  // describe('events', () => {});
});
