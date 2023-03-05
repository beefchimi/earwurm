import {describe, it, expect, vi} from 'vitest';

import {Earwurm} from '../Earwurm';
import {Stack} from '../Stack';
import type {Sound} from '../Sound';
import {tokens} from '../tokens';
import type {
  ManagerEventMap,
  ManagerConfig,
  LibraryEntry,
  LibraryKeys,
} from '../types';
import {mockData} from './mock';

describe('Earwurm component', () => {
  const mockEntries: LibraryEntry[] = [
    {id: 'Zero', path: mockData.audio},
    {id: 'One', path: 'to/no/file.mp3'},
    {id: 'Two', path: ''},
  ];

  describe('initialization', () => {
    const testManager = new Earwurm();

    it('is initialized with default values', () => {
      expect(testManager).toBeInstanceOf(Earwurm);

      // Class static properties
      expect(Earwurm).toHaveProperty('maxStackSize', tokens.maxStackSize);
      expect(Earwurm).toHaveProperty('suspendAfterMs', tokens.suspendAfterMs);

      // Instance properties
      expect(testManager).toHaveProperty('volume', 1);
      expect(testManager).toHaveProperty('mute', false);
      expect(testManager).toHaveProperty('unlocked', false);
      expect(testManager).toHaveProperty('keys', []);
      expect(testManager).toHaveProperty('state', 'suspended');
      expect(testManager).toHaveProperty('playing', false);
    });
  });

  // `mute` accessor is covered in `Abstract.test.ts`.
  // describe('mute', () => {});

  // `volume` accessor is covered in `Abstract.test.ts`.
  // describe('volume', () => {});

  // `unlocked` getter is covered in `unlock()` test.
  // describe('unlocked', () => {});

  describe('keys', () => {
    it('contains ids of each active Stack', async () => {
      const testManager = new Earwurm();

      expect(testManager.keys).toHaveLength(0);
      testManager.add(...mockEntries);

      expect(testManager.keys).toStrictEqual(['Zero', 'One', 'Two']);
      testManager.remove('Zero');
      expect(testManager.keys).toStrictEqual(['One', 'Two']);
    });
  });

  describe('state', () => {
    const clickEvent = new Event('click');

    it('triggers `statechange` event for every state', async () => {
      const testManager = new Earwurm();
      const spyState: ManagerEventMap['statechange'] = vi.fn((_state) => {});

      testManager.on('statechange', spyState);

      expect(spyState).not.toBeCalled();
      expect(testManager.state).toBe('suspended');

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      // await vi.advanceTimersToNextTimerAsync();

      expect(spyState).toBeCalledTimes(1);
      expect(spyState).toBeCalledWith('running');

      testManager.stop();

      // `suspending/suspended` are called in rapid succession.
      expect(spyState).toBeCalledTimes(3);
      expect(spyState).toBeCalledWith('suspending');
      expect(spyState).toBeCalledWith('suspended');

      testManager.teardown();

      expect(spyState).toBeCalledTimes(4);
      expect(spyState).toBeCalledWith('closed');

      // TODO: Find a way to mock an "interruption" so we
      // can test the `interrupted` state change.
      expect(spyState).not.toBeCalledTimes(5);
    });
  });

  describe('playing', () => {
    it('is `true` when any Sound is `playing`', async () => {
      const testManager = new Earwurm();
      const mockEntry = mockEntries[0];

      testManager.add(mockEntry);

      const stack = testManager.get(mockEntry.id);
      const sound = await stack?.prepare();

      expect(testManager.playing).toBe(false);
      sound?.play();
      expect(testManager.playing).toBe(true);
      vi.advanceTimersByTime(mockData.playDurationMs);
      expect(testManager.playing).toBe(false);
    });
  });

  describe('get()', () => {
    const testManager = new Earwurm();

    it('returns `undefined` when there is no matching Stack', async () => {
      const requestedStack = testManager.get('FakeId');
      expect(requestedStack).toBe(undefined);
    });

    it('returns the requested Stack when present', async () => {
      const mockEntry = mockEntries[0];
      testManager.add(mockEntry);

      const requestedStack = testManager.get(mockEntry.id);

      expect(requestedStack).toBeInstanceOf(Stack);
      expect(requestedStack?.id).toBe(mockEntry.id);
    });
  });

  describe('has()', () => {
    const testManager = new Earwurm();

    it('returns `false` when there is no matching Stack', async () => {
      const hasStack = testManager.has('FakeId');
      expect(hasStack).toBe(false);
    });

    it('returns `true` when the requested Stack is present', async () => {
      const mockEntry = mockEntries[0];
      testManager.add(mockEntry);

      const hasStack = testManager.has(mockEntry.id);
      expect(hasStack).toBe(true);
    });
  });

  describe('unlock()', () => {
    const clickEvent = new Event('click');

    it('unlocks AudioContext if not already unlocked', async () => {
      const testManager = new Earwurm();

      expect(testManager.unlocked).toBe(false);

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(testManager.unlocked).toBe(true);
    });

    it('does not unlock if already unlocked', async () => {
      const testManager = new Earwurm();
      const spyStateChange: ManagerEventMap['statechange'] = vi.fn(
        (_state) => {},
      );

      testManager.on('statechange', spyStateChange);
      expect(spyStateChange).not.toBeCalled();

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(spyStateChange).toBeCalledTimes(1);
      expect(spyStateChange).toBeCalledWith('running');

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(spyStateChange).not.toBeCalledTimes(2);
    });

    it('restores lock upon close', async () => {
      const testManager = new Earwurm();

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(testManager.unlocked).toBe(true);

      testManager.teardown();
      document.dispatchEvent(clickEvent);

      expect(testManager.unlocked).toBe(false);
    });

    it('returns instance', async () => {
      const testManager = new Earwurm();

      const beforeUnlock = testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(beforeUnlock).toBeInstanceOf(Earwurm);

      const afterUnlock = testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(afterUnlock).toBeInstanceOf(Earwurm);
    });
  });

  describe('add()', () => {
    it('creates a new Stack for each entry', async () => {
      const testManager = new Earwurm();
      const capturedKeys = testManager.add(...mockEntries);

      expect(testManager.keys).toHaveLength(mockEntries.length);
      expect(capturedKeys).toStrictEqual(mockEntries.map(({id}) => id));
    });

    it('replaces any existing Stacks', async () => {
      const testManager = new Earwurm();

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

      testManager.add(...mockEntries);

      const stack1 = testManager.get(mockEntries[1].id);
      const stack2 = testManager.get(mockEntries[2].id);

      expect(stack1?.path).toBe(mockEntries[1].path);
      expect(stack2?.path).toBe(mockEntries[2].path);
      expect(testManager.keys).toHaveLength(3);

      testManager.add(...mockChangedEntries);

      const updatedStack1 = testManager.get(mockEntries[1].id);
      const updatedStack2 = testManager.get(mockEntries[2].id);

      expect(updatedStack1?.path).toBe(mockChangedEntries[1].path);
      expect(updatedStack2?.path).toBe(mockChangedEntries[2].path);
      expect(testManager.keys).toHaveLength(4);
    });

    // TODO: Figure out how best to read `fadeMs` and `request` from Stack.
    it.skip('passes `fadeMs` and `request` to Stack', async () => {
      const mockConfig: ManagerConfig = {
        fadeMs: 100,
        request: {
          integrity: 'foo',
          method: 'bar',
          referrer: 'baz',
          keepalive: true,
        },
      };

      const testManager = new Earwurm(mockConfig);
      testManager.add(...mockEntries);

      const stack = testManager.get(mockEntries[0].id);
      expect(stack).toBeInstanceOf(Stack);
    });
  });

  describe('remove()', () => {
    it('removes any present Stacks', async () => {
      const testManager = new Earwurm();

      testManager.add(...mockEntries);

      const mockRemovedKeys: LibraryKeys = [
        mockEntries[0].id,
        mockEntries[1].id,
      ];
      const capturedKeys = testManager.remove(...mockRemovedKeys);

      expect(testManager.keys).toStrictEqual([mockEntries[2].id]);
      expect(capturedKeys).toStrictEqual(mockRemovedKeys);
    });

    it('returns empty array when no Stacks match', async () => {
      const testManager = new Earwurm();

      testManager.add(...mockEntries);

      const capturedKeys = testManager.remove('Foo', 'Bar');
      expect(capturedKeys).toStrictEqual([]);
    });

    it('tears down Stacks before removing from library', async () => {
      const testManager = new Earwurm();

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

      const spyStack1StateChange = vi.fn();
      const spyStack2StateChange = vi.fn();

      testManager.add(...mockEntries);

      const stack1 = testManager.get(mockEntries[1].id);
      stack1?.on('statechange', spyStack1StateChange);
      await stack1?.prepare().then((sound) => sound.play());

      expect(spyStack1StateChange).toBeCalledTimes(3);
      expect(stack1?.state).toBe('playing');

      const stack2 = testManager.get(mockEntries[2].id);
      stack2?.on('statechange', spyStack2StateChange);
      await stack2?.prepare().then((sound) => sound.play());

      expect(spyStack2StateChange).toBeCalledTimes(3);
      expect(stack2?.state).toBe('playing');

      testManager.add(...mockChangedEntries);

      expect(spyStack1StateChange).toBeCalledTimes(4);
      expect(stack1?.state).toBe('idle');

      expect(spyStack2StateChange).toBeCalledTimes(4);
      expect(stack2?.state).toBe('idle');
    });
  });

  describe('stop()', () => {
    it('stops all playing sounds with each Stack', async () => {
      const testManager = new Earwurm();

      const stacks: Stack[] = [];
      const stackCount = mockEntries.length;

      const sounds: Array<Promise<Sound>> = [];
      const soundsPerStack = 4;

      testManager.add(...mockEntries);

      for (let i = 0; i < stackCount; i++) {
        const matchedStack = testManager.get(mockEntries[i].id);
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

      expect(testManager.playing).toBe(true);
      expect(testManager.keys).toHaveLength(3);

      testManager.stop();

      expect(testManager.playing).toBe(false);
      expect(testManager.keys).toHaveLength(3);
    });

    it('returns instance', async () => {
      const testManager = new Earwurm();

      testManager.add(...mockEntries);

      const result = testManager.stop();
      expect(result).toBeInstanceOf(Earwurm);
    });
  });

  describe('teardown()', () => {
    const clickEvent = new Event('click');

    it('calls `teardown` on every Stack', async () => {
      const testManager = new Earwurm();
      const spyStackTeardown = vi.spyOn(Stack.prototype, 'teardown');

      testManager.add(...mockEntries);
      testManager.teardown();

      expect(spyStackTeardown).toBeCalledTimes(mockEntries.length);
    });

    it('empties the `library`', async () => {
      const testManager = new Earwurm();

      testManager.add(...mockEntries);
      expect(testManager.keys).toHaveLength(mockEntries.length);

      testManager.teardown();
      expect(testManager.keys).toStrictEqual([]);
    });

    it('does not resume the AudioContext', async () => {
      const testManager = new Earwurm();

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      vi.advanceTimersByTime(tokens.suspendAfterMs - 1);
      expect(testManager.state).toBe('running');

      testManager.teardown();
      expect(testManager.state).toBe('closed');

      // You shouldn't really be able to add entries once closed...
      testManager.add(...mockEntries);

      const stack0 = testManager.get(mockEntries[0].id);
      const stack0Sound = await stack0?.prepare();

      expect(testManager.state).toBe('closed');
      stack0Sound?.play();
      expect(testManager.state).toBe('closed');

      vi.advanceTimersByTime(tokens.suspendAfterMs);
      expect(testManager.state).toBe('closed');
    });

    it('closes the AudioContext', async () => {
      const testManager = new Earwurm();
      const spyClose = vi.spyOn(AudioContext.prototype, 'close');

      testManager.teardown();

      expect(spyClose).toBeCalled();
    });

    it('removes state change listener, preventing further state changes', async () => {
      const testManager = new Earwurm();
      expect(testManager.state).toBe('suspended');

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(testManager.state).toBe('running');

      testManager.teardown();
      expect(testManager.state).toBe('closed');

      testManager.add(...mockEntries);

      const stack = testManager.get(mockEntries[0].id);
      const sound = await stack?.prepare();

      sound?.play();

      // Not sure how to check active events on the `AudioContext`.
      expect(testManager.state).toBe('closed');
    });

    // TODO: Figure out how to test the emitted error.
    it('throws error if AudioContext cannot be closed', async () => {
      const testManager = new Earwurm();
      const mockErrorMessage = 'Mock error message';

      const spyError: ManagerEventMap['error'] = vi.fn((_error) => {});
      testManager.on('error', spyError);

      vi.spyOn(AudioContext.prototype, 'close').mockImplementationOnce(() => {
        throw new Error(mockErrorMessage);
      });

      expect(() => testManager.teardown()).toThrowError(mockErrorMessage);

      /*
      expect(spyError).toBeCalledWith([
        'Failed to close the Earwurm AudioContext.',
        mockErrorMessage,
      ]);
      */
    });

    it('removes any event listeners', async () => {
      const testManager = new Earwurm();
      const spyError = vi.fn();
      const spyStateChange = vi.fn();

      testManager.on('error', spyError);
      testManager.on('statechange', spyStateChange);

      expect(testManager.activeEvents).toHaveLength(2);
      testManager.teardown();
      expect(testManager.activeEvents).toHaveLength(0);
    });

    it('returns instance', async () => {
      const testManager = new Earwurm();

      testManager.add(...mockEntries);

      const result = testManager.teardown();
      expect(result).toBeInstanceOf(Earwurm);
    });
  });

  describe('#autoSuspend()', () => {
    const clickEvent = new Event('click');

    it('registers once `state` is `running`', async () => {
      const testManager = new Earwurm();
      expect(testManager.state).toBe('suspended');

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(testManager.state).toBe('running');
      vi.advanceTimersByTime(tokens.suspendAfterMs - 1);
      expect(testManager.state).toBe('running');

      vi.advanceTimersByTime(1);
      expect(testManager.state).toBe('suspended');
    });

    // TODO: Figure out a way to force `AudioContext.state`
    // to initialize with `running`.
    it.todo('can register upon initialization');

    it('resets countdown when Stack states change', async () => {
      const testManager = new Earwurm();
      testManager.add(...mockEntries);

      const stack0 = testManager.get(mockEntries[0].id);

      // Beginning of suspension timer.
      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(testManager.state).toBe('running');
      vi.advanceTimersByTime(tokens.suspendAfterMs - 1);
      expect(testManager.state).toBe('running');

      // `Sound` preparation triggers `Stack` state changes,
      // resulting in a suspension timer reset.
      const stack0Sound = await stack0?.prepare();

      vi.advanceTimersByTime(1);
      expect(testManager.state).toBe('running');
      vi.advanceTimersByTime(tokens.suspendAfterMs - 2);
      expect(testManager.state).toBe('running');

      expect(stack0?.playing).toBe(false);
      // Another suspension timer reset.
      stack0Sound?.play();
      expect(stack0?.playing).toBe(true);

      vi.advanceTimersByTime(1);
      expect(testManager.state).toBe('running');

      // End of `Sound` + Reset of suspension timer.
      vi.advanceTimersByTime(mockData.playDurationMs - 1);
      expect(stack0?.playing).toBe(false);

      vi.advanceTimersByTime(tokens.suspendAfterMs - 1);
      expect(testManager.state).toBe('running');

      vi.advanceTimersByTime(1);
      expect(testManager.state).toBe('suspended');
    });

    it('triggers state changes', async () => {
      const testManager = new Earwurm();
      const spyStateChange: ManagerEventMap['statechange'] = vi.fn(
        (_state) => {},
      );

      testManager.on('statechange', spyStateChange);

      expect(spyStateChange).not.toBeCalled();

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      expect(spyStateChange).toBeCalledWith('running');
      vi.advanceTimersByTime(tokens.suspendAfterMs);
      expect(spyStateChange).toBeCalledWith('suspending');
      expect(spyStateChange).toBeCalledWith('suspended');
    });

    // TODO: Is there any good way / value in testing these conditions?
    it.todo('does not re-register while `suspending`');
    it.todo('does not re-register if already `suspended`');

    it('does not allow suspension if `closed`', async () => {
      const testManager = new Earwurm();

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      vi.advanceTimersByTime(tokens.suspendAfterMs);
      expect(testManager.state).toBe('suspended');

      testManager.teardown();
      expect(testManager.state).toBe('closed');

      vi.advanceTimersByTime(tokens.suspendAfterMs);
      expect(testManager.state).toBe('closed');
    });
  });

  describe('#autoResume()', () => {
    const clickEvent = new Event('click');

    it('resumes once a `Sound` plays', async () => {
      const testManager = new Earwurm();
      testManager.add(...mockEntries);

      testManager.unlock();
      document.dispatchEvent(clickEvent);

      const stack0 = testManager.get(mockEntries[0].id);
      const stack0Sound = await stack0?.prepare();

      expect(testManager.state).toBe('running');
      vi.advanceTimersByTime(tokens.suspendAfterMs);
      expect(testManager.state).toBe('suspended');

      stack0Sound?.play();
      expect(testManager.state).toBe('running');

      vi.advanceTimersByTime(mockData.playDurationMs);
      expect(testManager.state).toBe('running');

      vi.advanceTimersByTime(tokens.suspendAfterMs);
      expect(testManager.state).toBe('suspended');
    });

    // TODO: Cannot test this until we can "interrupt" the suspension.
    it('queues a resume if `state` is `suspending`');

    // TODO: Figure out how to test this.
    it('throws error if the resume fails');
  });

  // Both `statechange` and `error` are covered in other tests.
  // describe('events', () => {});
});
