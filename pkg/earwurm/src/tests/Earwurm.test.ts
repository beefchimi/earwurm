import {afterEach, describe, it, expect, vi} from 'vitest';
import {mockData} from '@earwurm/mocks';

import {Earwurm} from '../Earwurm';
import {Stack} from '../Stack';
import type {Sound} from '../Sound';

import type {
  ManagerEventMap,
  ManagerConfig,
  LibraryEntry,
  StackId,
} from '../types';

import {managerSetup, mockEntries, mockInitialKeys} from './helpers';

describe('Earwurm component', () => {
  let mockManager = new Earwurm();

  afterEach(() => {
    mockManager.teardown();
    mockManager = new Earwurm();
  });

  describe('initialization', () => {
    it('is initialized with default values', async () => {
      expect(mockManager).toBeInstanceOf(Earwurm);

      // Instance properties
      expect(mockManager).toHaveProperty('transitions', false);
      expect(mockManager).toHaveProperty('volume', 1);
      expect(mockManager).toHaveProperty('mute', false);
      expect(mockManager).toHaveProperty('unlocked', false);
      expect(mockManager).toHaveProperty('keys', []);
      expect(mockManager).toHaveProperty('state', 'suspended');
      expect(mockManager).toHaveProperty('playing', false);
    });
  });

  // `mute` accessor is covered in `Abstract.test.ts`.
  // describe('mute', () => {});

  // `volume` accessor is covered in `Abstract.test.ts`.
  // describe('volume', () => {});

  // `unlocked` getter is covered in `unlock()` test.
  // describe('unlocked', () => {});

  describe('transitions', () => {
    it('allows `set` and `get`', async () => {
      expect(mockManager.transitions).toBe(false);
      mockManager.transitions = true;
      expect(mockManager.transitions).toBe(true);
    });

    it('updates equivalent prop on all contained Stacks', async () => {
      const stackIds = mockEntries.map(({id}) => id);
      mockManager.add(...mockEntries);

      stackIds.forEach((id) => {
        expect(mockManager.get(id)?.transitions).toBe(false);
      });

      mockManager.transitions = true;

      stackIds.forEach((id) => {
        expect(mockManager.get(id)?.transitions).toBe(true);
      });

      mockManager.transitions = false;

      stackIds.forEach((id) => {
        expect(mockManager.get(id)?.transitions).toBe(false);
      });
    });
  });

  describe('keys', () => {
    it('contains ids of each active Stack', async () => {
      expect(mockManager.keys).toHaveLength(0);
      mockManager.add(...mockEntries);

      expect(mockManager.keys).toStrictEqual(['Zero', 'One', 'Two']);
      mockManager.remove('Zero');
      expect(mockManager.keys).toStrictEqual(['One', 'Two']);
    });
  });

  describe('state', () => {
    const clickEvent = new Event('click');

    it('triggers `state` event for every state', async () => {
      const spyState: ManagerEventMap['state'] = vi.fn((_current) => {});
      mockManager.on('state', spyState);

      expect(spyState).not.toBeCalled();
      expect(mockManager.state).toBe('suspended');

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      // await vi.advanceTimersToNextTimerAsync();

      expect(spyState).toBeCalledTimes(1);
      expect(spyState).toBeCalledWith('running');

      mockManager.stop();

      // `suspending/suspended` are called in rapid succession.
      expect(spyState).toBeCalledTimes(3);
      expect(spyState).toBeCalledWith('suspending');
      expect(spyState).toBeCalledWith('suspended');

      mockManager.teardown();

      expect(spyState).toBeCalledTimes(4);
      expect(spyState).toBeCalledWith('closed');

      // TODO: Find a way to mock an "interruption" so we
      // can test the `interrupted` state change.
      expect(spyState).not.toBeCalledTimes(5);
    });
  });

  describe('playing', () => {
    it('is `true` when any Sound is `playing`', async () => {
      const mockEntry = mockEntries[0];

      mockManager.add(mockEntry);

      const stack = mockManager.get(mockEntry.id);
      const sound = await stack?.prepare();

      expect(mockManager.playing).toBe(false);
      sound?.play();
      expect(mockManager.playing).toBe(true);
      vi.advanceTimersByTime(mockData.playDurationMs);
      expect(mockManager.playing).toBe(false);
    });
  });

  describe('get()', () => {
    it('returns `undefined` when there is no matching Stack', async () => {
      const requestedStack = mockManager.get('FakeId');
      expect(requestedStack).toBe(undefined);
    });

    it('returns the requested Stack when present', async () => {
      const mockEntry = mockEntries[0];
      mockManager.add(mockEntry);

      const requestedStack = mockManager.get(mockEntry.id);

      expect(requestedStack).toBeInstanceOf(Stack);
      expect(requestedStack?.id).toBe(mockEntry.id);
    });
  });

  describe('has()', () => {
    it('returns `false` when there is no matching Stack', async () => {
      const hasStack = mockManager.has('FakeId');
      expect(hasStack).toBe(false);
    });

    it('returns `true` when the requested Stack is present', async () => {
      const mockEntry = mockEntries[0];
      mockManager.add(mockEntry);

      const hasStack = mockManager.has(mockEntry.id);
      expect(hasStack).toBe(true);
    });
  });

  describe('unlock()', () => {
    const clickEvent = new Event('click');

    it('unlocks AudioContext if not already unlocked', async () => {
      expect(mockManager.unlocked).toBe(false);

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(mockManager.unlocked).toBe(true);
    });

    it('does not unlock if already unlocked', async () => {
      const spyState: ManagerEventMap['state'] = vi.fn((_current) => {});

      mockManager.on('state', spyState);
      expect(spyState).not.toBeCalled();

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(spyState).toBeCalledTimes(1);
      expect(spyState).toBeCalledWith('running');

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(spyState).not.toBeCalledTimes(2);
    });

    it('restores lock upon close', async () => {
      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(mockManager.unlocked).toBe(true);

      mockManager.teardown();
      document.dispatchEvent(clickEvent);

      expect(mockManager.unlocked).toBe(false);
    });

    it('returns instance', async () => {
      const beforeUnlock = mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(beforeUnlock).toBeInstanceOf(Earwurm);

      const afterUnlock = mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(afterUnlock).toBeInstanceOf(Earwurm);
    });
  });

  describe('add()', () => {
    it('creates a new Stack for each entry', async () => {
      const capturedKeys = mockManager.add(...mockEntries);

      expect(mockManager.keys).toHaveLength(mockEntries.length);
      expect(capturedKeys).toStrictEqual(mockEntries.map(({id}) => id));
    });

    it('replaces any existing Stacks', async () => {
      const mockChangedEntries: LibraryEntry[] = [
        {
          id: 'Unique',
          path: 'does/not/overwrite/anything.wav',
        },
        {
          id: mockEntries[1].id,
          path: 'some/new/path/file.webm',
        },
        {
          id: mockEntries[2].id,
          path: 'another/changed/path.mp3',
        },
      ];

      mockManager.add(...mockEntries);

      const stack1 = mockManager.get(mockEntries[1].id);
      const stack2 = mockManager.get(mockEntries[2].id);

      expect(stack1?.path).toBe(mockEntries[1].path);
      expect(stack2?.path).toBe(mockEntries[2].path);
      expect(mockManager.keys).toHaveLength(3);

      mockManager.add(...mockChangedEntries);

      const updatedStack1 = mockManager.get(mockEntries[1].id);
      const updatedStack2 = mockManager.get(mockEntries[2].id);

      expect(updatedStack1?.path).toBe(mockChangedEntries[1].path);
      expect(updatedStack2?.path).toBe(mockChangedEntries[2].path);
      expect(mockManager.keys).toHaveLength(4);
    });

    it('emits `library` event with new and old `keys`', async () => {
      const spyLibrary: ManagerEventMap['library'] = vi.fn((_new, _old) => {});

      mockManager.on('library', spyLibrary);
      expect(spyLibrary).not.toBeCalled();

      mockManager.add(...mockEntries);
      expect(spyLibrary).toBeCalledWith(mockInitialKeys, []);
      expect(spyLibrary).toBeCalledTimes(1);

      // Does not add/remove when both `id + path` are identical.
      mockManager.add(mockEntries[0]);
      expect(spyLibrary).not.toBeCalledTimes(2);

      const mockUniqueEntry: LibraryEntry = {
        id: 'Unique',
        path: 'does/not/overwrite/anything.wav',
      };
      const mockChangedEntries: LibraryEntry[] = [
        mockUniqueEntry,
        mockEntries[1],
      ];

      mockManager.add(...mockChangedEntries);
      expect(spyLibrary).toBeCalledTimes(2);
      expect(spyLibrary).toBeCalledWith(
        [...mockInitialKeys, mockUniqueEntry.id],
        mockInitialKeys,
      );

      const keysSnapshot = mockManager.keys;

      // Emits twice as an existing key is removed then re-added
      // as a result of the `path` value changing.
      mockManager.add({...mockUniqueEntry, path: 'changed'});
      expect(spyLibrary).toBeCalledTimes(4);

      expect(spyLibrary).toBeCalledWith(mockInitialKeys, keysSnapshot);
      expect(spyLibrary).toHaveBeenLastCalledWith(
        keysSnapshot,
        mockInitialKeys,
      );
    });

    // TODO: Figure out how best to read `transitions` and `request` from Stack.
    it.skip('passes `transitions` and `request` to Stack', async () => {
      const mockConfig: ManagerConfig = {
        transitions: true,
        request: {
          integrity: 'foo',
          method: 'bar',
          referrer: 'baz',
          keepalive: true,
        },
      };

      const configManager = new Earwurm(mockConfig);
      configManager.add(...mockEntries);

      const stack = configManager.get(mockEntries[0].id);
      expect(stack).toBeInstanceOf(Stack);
    });
  });

  describe('remove()', () => {
    it('removes any present Stacks', async () => {
      mockManager.add(...mockEntries);

      const mockRemovedKeys: StackId[] = [mockEntries[0].id, mockEntries[1].id];
      const capturedKeys = mockManager.remove(...mockRemovedKeys);

      expect(mockManager.keys).toStrictEqual([mockEntries[2].id]);
      expect(capturedKeys).toStrictEqual(mockRemovedKeys);
    });

    it('returns empty array when no Stacks match', async () => {
      mockManager.add(...mockEntries);

      const capturedKeys = mockManager.remove('Foo', 'Bar');
      expect(capturedKeys).toStrictEqual([]);
    });

    it('emits `library` event with new and old `keys`', async () => {
      const spyLibrary: ManagerEventMap['library'] = vi.fn((_new, _old) => {});

      mockManager.add(...mockEntries);
      mockManager.on('library', spyLibrary);

      mockManager.remove('Foo', 'Bar');
      expect(spyLibrary).not.toBeCalled();

      mockManager.remove(mockEntries[1].id);
      expect(spyLibrary).toBeCalledWith(
        [mockEntries[0].id, mockEntries[2].id],
        mockInitialKeys,
      );
    });

    it('calls `suspend` if library becomes empty', async () => {
      const spySuspend = vi.spyOn(Earwurm.prototype, 'suspend');

      mockManager.add(...mockEntries);

      const mockAllKeys: StackId[] = mockEntries.map(({id}) => id);
      expect(mockManager.keys).toStrictEqual(mockAllKeys);
      expect(spySuspend).not.toBeCalled();

      mockManager.remove(...mockAllKeys);

      expect(mockManager.keys).toStrictEqual([]);
      expect(spySuspend).toBeCalledTimes(1);
    });

    it('tears down Stacks before removing from library', async () => {
      const mockChangedEntries: LibraryEntry[] = [
        {
          id: mockEntries[1].id,
          path: 'some/new/path/file.webm',
        },
        {
          id: mockEntries[2].id,
          path: 'another/changed/path.mp3',
        },
      ];

      const spyStack1State = vi.fn();
      const spyStack2State = vi.fn();

      mockManager.add(...mockEntries);

      const stack1 = mockManager.get(mockEntries[1].id);
      stack1?.on('state', spyStack1State);
      await stack1?.prepare().then((sound) => sound.play());

      expect(spyStack1State).toBeCalledTimes(3);
      expect(stack1?.state).toBe('playing');

      const stack2 = mockManager.get(mockEntries[2].id);
      stack2?.on('state', spyStack2State);
      await stack2?.prepare().then((sound) => sound.play());

      expect(spyStack2State).toBeCalledTimes(3);
      expect(stack2?.state).toBe('playing');

      mockManager.add(...mockChangedEntries);

      expect(spyStack1State).toBeCalledTimes(4);
      expect(stack1?.state).toBe('idle');

      expect(spyStack2State).toBeCalledTimes(4);
      expect(stack2?.state).toBe('idle');
    });
  });

  describe('resume()', () => {
    const clickEvent = new Event('click');

    it('resumes once a `Sound` plays', async () => {
      managerSetup(mockManager, mockEntries);

      const stack0 = mockManager.get(mockEntries[0].id);
      const stack0Sound = await stack0?.prepare();

      expect(mockManager.state).toBe('running');
      mockManager.suspend();
      expect(mockManager.state).toBe('suspended');

      stack0Sound?.play();
      expect(mockManager.state).toBe('running');

      vi.advanceTimersByTime(mockData.playDurationMs * 2);
      expect(mockManager.state).toBe('running');
    });

    it('calls `resume` if state is `suspended` or `interrupted`', async () => {
      const spyResume = vi.spyOn(AudioContext.prototype, 'resume');

      expect(mockManager.unlocked).toBe(false);
      expect(mockManager.state).toBe('suspended');
      expect(spyResume).not.toBeCalled();

      mockManager.resume();

      expect(mockManager.unlocked).toBe(true);
      expect(mockManager.state).toBe('running');
      expect(spyResume).toBeCalled();
    });

    it('does not call `resume` if already running', async () => {
      const spyResume = vi.spyOn(AudioContext.prototype, 'resume');

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(mockManager.state).toBe('running');
      expect(spyResume).toBeCalledTimes(2);

      mockManager.resume();
      expect(spyResume).not.toBeCalledTimes(3);
    });

    it('does not call `resume` if `closed`', async () => {
      const spyResume = vi.spyOn(AudioContext.prototype, 'resume');

      mockManager.teardown();
      mockManager.resume();

      // TODO: Should also test against `suspending` state.
      expect(mockManager.state).toBe('closed');
      expect(spyResume).not.toBeCalled();
    });

    it('returns instance', async () => {
      const returnValue = mockManager.resume();
      expect(returnValue).toBeInstanceOf(Earwurm);
    });
  });

  describe('suspend()', () => {
    const clickEvent = new Event('click');

    // TODO: Figure out how to test against `interrupted` value.
    it('calls `suspend` if `running` or `interrupted`', async () => {
      const spySuspend = vi.spyOn(AudioContext.prototype, 'suspend');

      expect(mockManager.state).toBe('suspended');

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(mockManager.state).toBe('running');

      mockManager.suspend();

      expect(spySuspend).toBeCalledTimes(1);
      expect(mockManager.state).toBe('suspended');
    });

    it('does not call `suspend` if already `suspended`', async () => {
      const spySuspend = vi.spyOn(AudioContext.prototype, 'suspend');
      mockManager.suspend();

      // TODO: Test against `suspending` as well
      expect(mockManager.state).toBe('suspended');
      expect(spySuspend).not.toBeCalled();
    });

    it('does not call `suspend` if `closed`', async () => {
      const spySuspend = vi.spyOn(AudioContext.prototype, 'suspend');

      mockManager.unlock();
      document.dispatchEvent(clickEvent);
      expect(spySuspend).not.toBeCalled();

      mockManager.teardown();
      // Calls once because of the empty library
      expect(spySuspend).toBeCalledTimes(1);

      mockManager.suspend();

      expect(mockManager.state).toBe('closed');
      expect(spySuspend).not.toBeCalledTimes(2);
    });

    it('returns instance', async () => {
      const returnValue = mockManager.suspend();
      expect(returnValue).toBeInstanceOf(Earwurm);
    });
  });

  describe('stop()', () => {
    it('stops all playing sounds with each Stack', async () => {
      const stacks: Stack[] = [];
      const stackCount = mockEntries.length;

      const sounds: Array<Promise<Sound>> = [];
      const soundsPerStack = 4;

      mockManager.add(...mockEntries);

      for (let i = 0; i < stackCount; i++) {
        const matchedStack = mockManager.get(mockEntries[i].id);
        if (matchedStack) stacks.push(matchedStack);
      }

      stacks.forEach((stack) => {
        for (let i = 0; i < soundsPerStack; i++) {
          sounds.push(stack.prepare());
        }
      });

      for await (const sound of sounds) {
        sound.play();
      }

      expect(mockManager.playing).toBe(true);
      expect(mockManager.keys).toHaveLength(3);

      mockManager.stop();

      expect(mockManager.playing).toBe(false);
      expect(mockManager.keys).toHaveLength(3);
    });

    it('calls `suspend`', async () => {
      const spySuspend = vi.spyOn(Earwurm.prototype, 'suspend');

      expect(spySuspend).not.toBeCalled();
      mockManager.stop();
      expect(spySuspend).toBeCalledTimes(1);
    });

    it('returns instance', async () => {
      mockManager.add(...mockEntries);

      const result = mockManager.stop();
      expect(result).toBeInstanceOf(Earwurm);
    });
  });

  describe('teardown()', () => {
    const clickEvent = new Event('click');

    it('calls `teardown` on every Stack', async () => {
      const spyStackTeardown = vi.spyOn(Stack.prototype, 'teardown');

      mockManager.add(...mockEntries);
      mockManager.teardown();

      expect(spyStackTeardown).toBeCalledTimes(mockEntries.length);
    });

    it('empties the `library`', async () => {
      mockManager.add(...mockEntries);
      expect(mockManager.keys).toHaveLength(mockEntries.length);

      mockManager.teardown();
      expect(mockManager.keys).toStrictEqual([]);
    });

    it('emits `library` event with empty array', async () => {
      const spyLibrary: ManagerEventMap['library'] = vi.fn((_new, _old) => {});

      mockManager.add(...mockEntries);

      mockManager.on('library', spyLibrary);
      expect(spyLibrary).not.toBeCalled();

      mockManager.teardown();
      expect(spyLibrary).toBeCalledWith([], mockInitialKeys);
    });

    it('does not resume the AudioContext', async () => {
      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      vi.advanceTimersByTime(1);
      expect(mockManager.state).toBe('running');

      mockManager.teardown();
      expect(mockManager.state).toBe('closed');

      // You shouldn't really be able to add entries once closed...
      mockManager.add(...mockEntries);

      const stack0 = mockManager.get(mockEntries[0].id);
      const stack0Sound = await stack0?.prepare();

      expect(mockManager.state).toBe('closed');
      stack0Sound?.play();
      expect(mockManager.state).toBe('closed');

      vi.advanceTimersByTime(1);
      expect(mockManager.state).toBe('closed');
    });

    it('closes the AudioContext', async () => {
      const spyClose = vi.spyOn(AudioContext.prototype, 'close');

      mockManager.teardown();
      expect(spyClose).toBeCalled();
    });

    it('removes state change listener, preventing further state changes', async () => {
      expect(mockManager.state).toBe('suspended');

      mockManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(mockManager.state).toBe('running');

      mockManager.teardown();
      expect(mockManager.state).toBe('closed');

      mockManager.add(...mockEntries);

      const stack = mockManager.get(mockEntries[0].id);
      const sound = await stack?.prepare();

      sound?.play();

      // Not sure how to check active events on the `AudioContext`.
      expect(mockManager.state).toBe('closed');
    });

    // TODO: Figure out how to test the emitted error.
    it('throws error if AudioContext cannot be closed', async () => {
      const mockErrorMessage = 'Mock error message';

      const spyError: ManagerEventMap['error'] = vi.fn((_messages) => {});
      mockManager.on('error', spyError);

      vi.spyOn(AudioContext.prototype, 'close').mockImplementationOnce(() => {
        throw new Error(mockErrorMessage);
      });

      expect(() => mockManager.teardown()).toThrowError(mockErrorMessage);
      // expect(spyError).toBeCalledWith([tokens.error.close, mockErrorMessage]);
    });

    it('removes any event listeners', async () => {
      const spyState = vi.fn();
      const spyError = vi.fn();

      mockManager.on('state', spyState);
      mockManager.on('error', spyError);

      expect(mockManager.activeEvents).toHaveLength(2);
      mockManager.teardown();
      expect(mockManager.activeEvents).toHaveLength(0);
    });

    it('returns instance', async () => {
      mockManager.add(...mockEntries);

      const result = mockManager.teardown();
      expect(result).toBeInstanceOf(Earwurm);
    });
  });

  // Most events are covered in other tests:
  // `state`, `library`, `volume`, `mute`, and `error`.
  describe('events', () => {
    describe('play', () => {
      it('triggers as sounds play + stop/expire', async () => {
        const spyPlay: ManagerEventMap['play'] = vi.fn((_active) => {});
        mockManager.on('play', spyPlay);

        managerSetup(mockManager, mockEntries);

        const stack0 = mockManager.get(mockEntries[0].id);
        const stack0Sound = await stack0?.prepare();

        expect(spyPlay).not.toBeCalled();
        stack0Sound?.play();
        expect(spyPlay).toHaveBeenNthCalledWith(1, true);

        stack0Sound?.stop();
        expect(spyPlay).toHaveBeenNthCalledWith(2, false);

        expect(spyPlay).not.toBeCalledTimes(3);
      });

      it('does not trigger a 2nd time when the state hasnt changed', async () => {
        const spyPlay: ManagerEventMap['play'] = vi.fn((_active) => {});
        mockManager.on('play', spyPlay);

        managerSetup(mockManager, mockEntries);

        const stack0 = mockManager.get(mockEntries[0].id);
        const stack0Sound = await stack0?.prepare();

        expect(spyPlay).not.toBeCalled();
        stack0Sound?.play();
        expect(spyPlay).toHaveBeenNthCalledWith(1, true);

        const stack1 = mockManager.get(mockEntries[1].id);
        const stack1Sound = await stack1?.prepare();
        stack1Sound?.play();

        expect(spyPlay).not.toBeCalledTimes(2);
      });
    });
  });
});
