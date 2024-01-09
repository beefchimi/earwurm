import {afterEach, describe, it, expect, vi} from 'vitest';

import {mockData} from '../../mocks';
import {arrayOfLength} from '../../utilities';

import {Stack} from '../Stack';
import {Sound} from '../Sound';

import {tokens} from '../tokens';
import type {StackEventMap, SoundEventMap} from '../types';

type StackConstructor = ConstructorParameters<typeof Stack>;

describe('Stack component', () => {
  const defaultContext = new AudioContext();
  const defaultAudioNode = new AudioNode();
  const defaultConstructorArgs: StackConstructor = [
    'MockStack',
    mockData.audio,
    defaultContext,
    defaultAudioNode,
  ];

  let mockStack = new Stack(...defaultConstructorArgs);

  afterEach(() => {
    mockStack.teardown();
    mockStack = new Stack(...defaultConstructorArgs);
  });

  describe('initialization', () => {
    it('is initialized with default values', async () => {
      expect(mockStack).toBeInstanceOf(Stack);

      // Instance properties
      expect(mockStack).toHaveProperty('transitions', false);
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

  describe('transitions', () => {
    it('allows `set` and `get`', async () => {
      expect(mockStack.transitions).toBe(false);
      mockStack.transitions = true;
      expect(mockStack.transitions).toBe(true);
    });

    it('updates equivalent prop on all contained Sounds', async () => {
      const soundIds = ['One', 'Two', 'Three'];

      for (const id of soundIds) {
        await mockStack.prepare(id);
      }

      soundIds.forEach((id) => {
        expect(mockStack.get(id)?.transitions).toBe(false);
      });

      mockStack.transitions = true;

      soundIds.forEach((id) => {
        expect(mockStack.get(id)?.transitions).toBe(true);
      });

      mockStack.transitions = false;

      soundIds.forEach((id) => {
        expect(mockStack.get(id)?.transitions).toBe(false);
      });
    });
  });

  describe('keys', () => {
    it('contains ids of each unexpired Sound', async () => {
      const mockDurationHalf = Math.floor(mockData.playDurationMs / 2);
      const mockDurationQuarter = Math.floor(mockData.playDurationMs / 4);

      const sound1 = await mockStack.prepare('One');
      const sound2 = await mockStack.prepare('Two');
      const sound3 = await mockStack.prepare('Three');

      sound1.play();
      vi.advanceTimersByTime(mockDurationQuarter);
      sound2.play();
      vi.advanceTimersByTime(mockDurationQuarter);
      sound3.play();

      expect(mockStack.keys).toStrictEqual(['One', 'Two', 'Three']);
      vi.advanceTimersByTime(mockDurationHalf);
      expect(mockStack.keys).toStrictEqual(['Two', 'Three']);
      vi.advanceTimersByTime(mockDurationQuarter);
      expect(mockStack.keys).toStrictEqual(['Three']);
      vi.advanceTimersByTime(mockDurationQuarter);
      expect(mockStack.keys).toStrictEqual([]);
    });
  });

  describe('state', () => {
    it('triggers `state` event for every possible value', async () => {
      const spyState: StackEventMap['state'] = vi.fn((_current) => {});

      mockStack.on('state', spyState);

      expect(spyState).not.toBeCalled();
      expect(mockStack.state).toBe('idle');

      const soundFoo = mockStack.prepare('Foo');

      expect(spyState).toBeCalledWith('loading');
      await soundFoo.then((sound) => sound.play());

      expect(spyState).toBeCalledWith('playing');
      vi.advanceTimersToNextTimer();
      expect(spyState).toBeCalledWith('idle');

      // TODO: Find out why this no longer reports `3`.
      // expect(spyState).toBeCalledTimes(3);
    });
  });

  describe('playing', () => {
    it('is `true` when any Sound is `playing`', async () => {
      const sound = await mockStack.prepare();

      expect(mockStack.state).toBe('idle');
      expect(mockStack.playing).toBe(false);

      sound.play();

      expect(mockStack.state).toBe('playing');
      expect(mockStack.playing).toBe(true);

      vi.advanceTimersByTime(mockData.playDurationMs);

      expect(mockStack.state).toBe('idle');
      expect(mockStack.playing).toBe(false);
    });
  });

  describe('get()', () => {
    it('returns `undefined` when there is no matching Sound', async () => {
      await mockStack.prepare('RealId');

      const requestedSound = mockStack.get('FakeId');
      expect(requestedSound).toBe(undefined);
    });

    it('returns the requested Sound when present', async () => {
      const mockSoundId = 'RealId';
      const capturedSound = await mockStack.prepare(mockSoundId);
      const requestedSound = mockStack.get(mockSoundId);

      expect(requestedSound).toBeInstanceOf(Sound);
      expect(requestedSound).toBe(capturedSound);
    });
  });

  describe('has()', () => {
    it('returns `false` when there is no matching Sound', async () => {
      const hasSound = mockStack.has('FakeId');
      expect(hasSound).toBe(false);
    });

    it('returns `true` when the requested Sound is present', async () => {
      const mockSoundId = 'RealId';
      await mockStack.prepare(mockSoundId);
      const hasSound = mockStack.has(mockSoundId);

      expect(hasSound).toBe(true);
    });
  });

  describe('pause()', () => {
    it('pauses and retains every Sound within the Stack', async () => {
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
      await mockStack.prepare('Foo');
      const instance = mockStack.pause();

      expect(instance).toBe(mockStack);
    });
  });

  describe('stop()', () => {
    it('stops and removes every Sound within the Stack', async () => {
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

    it('emits `queue` event for each stopped Sound', async () => {
      const spyQueue: StackEventMap['queue'] = vi.fn((_new, _old) => {});

      mockStack.on('queue', spyQueue);
      expect(spyQueue).not.toBeCalled();

      await mockStack.prepare('One');
      await mockStack.prepare('Two');
      await mockStack.prepare('Three');

      expect(spyQueue).toBeCalledTimes(3);
      expect(spyQueue).toHaveBeenLastCalledWith(
        ['One', 'Two', 'Three'],
        ['One', 'Two'],
      );

      mockStack.stop();

      expect(spyQueue).toBeCalledTimes(6);
      expect(spyQueue).toHaveBeenLastCalledWith([], ['Three']);
    });

    it('returns instance', async () => {
      await mockStack.prepare('Foo');
      const instance = mockStack.stop();

      expect(instance).toBe(mockStack);
    });
  });

  describe('teardown()', () => {
    it('calls stop()', async () => {
      const spyStop = vi.spyOn(mockStack, 'stop');

      expect(spyStop).not.toBeCalled();
      mockStack.teardown();
      expect(spyStop).toBeCalledTimes(1);
    });

    it('empties all active events', async () => {
      mockStack.on('state', vi.fn());
      mockStack.on('error', vi.fn());

      expect(mockStack.activeEvents).toHaveLength(2);
      mockStack.teardown();
      expect(mockStack.activeEvents).toHaveLength(0);
    });

    it('returns instance', async () => {
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
      const mockSoundId = 'Foo';
      const sound = mockStack.prepare(mockSoundId);

      expect(sound).toBeInstanceOf(Promise);
      await expect(sound).resolves.toBeInstanceOf(Sound);
      await expect(sound).resolves.toHaveProperty('id', mockSoundId);
    });

    it('emits `queue` event with new and old `keys`', async () => {
      const mockSoundId1 = 'Foo';
      const mockSoundId2 = 'Bar';
      const spyQueue: StackEventMap['queue'] = vi.fn((_new, _old) => {});

      mockStack.on('queue', spyQueue);
      expect(spyQueue).not.toBeCalled();
      expect(mockStack.keys).toHaveLength(0);

      await mockStack.prepare(mockSoundId1);

      expect(spyQueue).toBeCalledTimes(1);
      expect(spyQueue).toBeCalledWith([mockSoundId1], []);
      expect(mockStack.keys).toHaveLength(1);

      await mockStack.prepare(mockSoundId2);

      expect(spyQueue).toBeCalledTimes(2);
      expect(spyQueue).toBeCalledWith(
        [mockSoundId1, mockSoundId2],
        [mockSoundId1],
      );
      expect(mockStack.keys).toHaveLength(2);
    });
  });

  describe('#load()', () => {
    it('sets state to `loading` until fetch is resolved', async () => {
      const sound = mockStack.prepare();

      expect(mockStack.state).toBe('loading');
      await sound;
      expect(mockStack.state).toBe('idle');
    });

    it('returns state to `playing` if a Sound was already playing', async () => {
      expect(mockStack.state).toBe('idle');
      await mockStack.prepare().then((sound) => sound.play());
      expect(mockStack.state).toBe('playing');

      const unplayedSound = mockStack.prepare();

      expect(mockStack.state).toBe('loading');
      await unplayedSound;
      expect(mockStack.state).toBe('playing');
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

      const spyError: StackEventMap['error'] = vi.fn((_message) => {});

      testStack.on('error', spyError);
      await testStack.prepare();

      expect(spyError).toBeCalledWith({
        id: mockStackId,
        message: [
          `Failed to load: ${mockPath}`,
          // This string ends with `[object Request]`.
          expect.stringContaining('Failed to parse URL from'),
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

    const mockConstructorArgs: StackConstructor = [
      mockStackId,
      mockData.audio,
      defaultContext,
      defaultAudioNode,
      {transitions: true},
    ];

    it('constructs Sound', async () => {
      const testStack = new Stack(...mockConstructorArgs);

      const mockSoundId = 'Foo';
      const sound = await testStack.prepare(mockSoundId);

      expect(sound).toHaveProperty('id', mockSoundId);

      expect(sound).toHaveProperty('buffer', {
        duration: 0,
        length: 1,
        // TODO: This test might fail locally...
        // If it does, it is because the fetch request needs
        // to be mocked so that we do not return a scratch buffer.
        // Returned object contains either:
        // {numberOfChannels: 1, sampleRate: 22050}
        // {numberOfChannels: 2, sampleRate: 44100}
        numberOfChannels: 1,
        sampleRate: 22050,
      });
      expect(sound).toHaveProperty('context', defaultContext);

      // TODO: Would be ideal to spy on the `Sound` constructor and
      // assert that it has been called with the expected parameters.

      // We still need to test for `options`.
      // expect(sound).toHaveProperty('options.transitions', true);
    });

    it('registers `state` multi-listener on Sound', async () => {
      const sound = await mockStack.prepare();

      sound.play().pause();
      expect(sound.activeEvents).toContain('state');
    });

    it('registers `ended` single-listener on Sound', async () => {
      const sound = await mockStack.prepare();

      sound.play();
      // No way to really check that the event is removed,
      // since the Sound is removed from the Stack upon `ended`.
      expect(sound.activeEvents).toContain('ended');
    });

    it('expires old sounds that fall outside of the `maxStackSize`', async () => {
      const testStack = new Stack(...mockConstructorArgs);
      const spyEnded: SoundEventMap['ended'] = vi.fn((_ended) => {});

      // Fill the `queue` up with the exact max number of Sounds.
      const pendingSounds = arrayOfLength(tokens.maxStackSize).map(
        async (_index) => await testStack.prepare(),
      );

      const sounds = await Promise.all(pendingSounds);
      const additionalSoundsCount = Math.floor(tokens.maxStackSize / 2);

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

      expect(testStack.keys).toHaveLength(tokens.maxStackSize);
      expect(spyEnded).toBeCalledTimes(additionalSoundsCount);
    });
  });

  // All events are covered in other tests:
  // `state`, `volume`, `mute`, and `error`.
  // describe('events', () => {});
});
