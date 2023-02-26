import {describe, it, expect, vi} from 'vitest';

import {Earwurm} from '../Earwurm';
import {tokens} from '../tokens';
import type {ManagerEventMap} from '../types';
import {mockData} from './mock';

describe('Earwurm component', () => {
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

      testManager.add(
        {id: 'One', path: mockData.audio},
        {id: 'Two', path: 'to/no/file.mp3'},
        {id: 'Three', path: ''},
      );

      expect(testManager.keys).toStrictEqual(['One', 'Two', 'Three']);
      testManager.remove('One');
      expect(testManager.keys).toStrictEqual(['Two', 'Three']);
    });
  });

  describe('state', () => {
    it('triggers `statechange` event for every state', async () => {
      const testManager = new Earwurm();
      const spyState: ManagerEventMap['statechange'] = vi.fn((_state) => {});

      testManager.on('statechange', spyState);

      expect(spyState).not.toBeCalled();
      expect(testManager.state).toBe('suspended');

      testManager.unlock();

      const clickEvent = new Event('click');
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

      testManager.add({id: 'One', path: mockData.audio});

      const stack = testManager.get('One');
      const sound = await stack?.prepare();

      expect(testManager.playing).toBe(false);
      sound?.play();
      expect(testManager.playing).toBe(true);
      vi.advanceTimersByTime(10);
      expect(testManager.playing).toBe(false);
    });
  });
});
