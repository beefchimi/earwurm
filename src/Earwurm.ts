import {EmittenCommon} from 'emitten';

import {getErrorMessage, unlockAudioContext} from './helpers';
import {clamp, msToSec, secToMs} from './utilities';
import {tokens} from './tokens';

import type {
  TimeoutId,
  ManagerState,
  ManagerEventMap,
  ManagerConfig,
  LibraryEntry,
  LibraryKeys,
  StackEventMap,
} from './types';

import {Stack} from './Stack';

export class Earwurm extends EmittenCommon<ManagerEventMap> {
  static readonly maxStackSize = tokens.maxStackSize;
  static readonly suspendAfterMs = tokens.suspendAfterMs;

  private _volume = 1;
  private _mute = false;
  private _keys: LibraryKeys = [];
  private _state: ManagerState = 'suspended';

  #context = new AudioContext();
  #gainNode = this.#context.createGain();

  #fadeSec = 0;
  #request: ManagerConfig['request'];
  #library: Stack[] = [];
  #suspendId: TimeoutId = 0;
  #queuedResume = false;

  // If the `AudioContext` is `running` upon initialization,
  // then it should be safe to mark audio as “unlocked”.
  private _unlocked = this.#context.state === 'running';

  constructor(config?: ManagerConfig) {
    super();

    this._volume = config?.volume ?? this._volume;
    this.#fadeSec = config?.fadeMs ? msToSec(config.fadeMs) : this.#fadeSec;
    this.#request = config?.request ?? undefined;

    this.#gainNode.connect(this.#context.destination);
    this.#gainNode.gain.setValueAtTime(this._volume, this.#context.currentTime);

    if (this._unlocked) this.#autoSuspend();

    this.#context.addEventListener('statechange', this.#handleStateChange);
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    const oldVolume = this._volume;
    const newVolume = clamp({preference: value, min: 0, max: 1});

    this._volume = newVolume;

    if (this._mute) return;

    this.#gainNode.gain
      .cancelScheduledValues(this.#context.currentTime)
      .setValueAtTime(oldVolume, this.#context.currentTime)
      .linearRampToValueAtTime(
        newVolume,
        this.#context.currentTime + this.#fadeSec,
      );
  }

  get mute() {
    return this._mute;
  }

  set mute(value: boolean) {
    this._mute = value;

    const fromValue = value ? this._volume : 0;
    const toValue = value ? 0 : this._volume;

    this.#gainNode.gain
      .cancelScheduledValues(this.#context.currentTime)
      .setValueAtTime(fromValue, this.#context.currentTime)
      .linearRampToValueAtTime(
        toValue,
        this.#context.currentTime + this.#fadeSec,
      );
  }

  get unlocked() {
    return this._unlocked;
  }

  get keys() {
    return this._keys;
  }

  get state() {
    return this._state;
  }

  get playing() {
    return this.#library.some((stack) => stack.state === 'playing');
  }

  get(id: LibraryEntry['id']) {
    return this.#library.find((stack) => stack.id === id);
  }

  has(id: LibraryEntry['id']) {
    return this.#library.some((stack) => stack.id === id);
  }

  unlock() {
    if (!this._unlocked) unlockAudioContext(this.#context);
    return this;
  }

  add(...entries: LibraryEntry[]) {
    const newKeys: LibraryKeys = [];

    const newStacks = entries.map(({id, path}) => {
      newKeys.push(id);

      const newStack = new Stack(id, path, this.#context, this.#gainNode, {
        fadeMs: secToMs(this.#fadeSec),
        request: this.#request,
      });

      newStack.on('statechange', this.#handleStackStateChange);

      return newStack;
    });

    const replacedKeys = this.#library.reduce<LibraryKeys>(
      (collection, {id}) =>
        newKeys.includes(id) ? [...collection, id] : collection,
      [],
    );

    this.remove(...replacedKeys);
    this.#setLibrary([...this.#library, ...newStacks]);

    return newKeys;
  }

  remove(...ids: LibraryKeys) {
    const removedKeys: LibraryKeys = [];

    const filteredLibrary = this.#library.filter((stack) => {
      const match = ids.includes(stack.id);

      if (match) {
        removedKeys.push(stack.id);
        stack.teardown();
      }

      return !match;
    });

    if (removedKeys.length) this.#setLibrary(filteredLibrary);

    return removedKeys;
  }

  stop() {
    this.#library.forEach((stack) => stack.stop());
    this.#handleSuspend();

    return this;
  }

  teardown() {
    this.#library.forEach((stack) => stack.teardown());
    this.#setLibrary([]);

    this.#context
      .close()
      .then(() => {
        this.#context.removeEventListener(
          'statechange',
          this.#handleStateChange,
        );
      })
      .catch((error) => {
        this.emit('error', [
          'Failed to close the Earwurm AudioContext.',
          getErrorMessage(error),
        ]);
      });

    this.empty();

    return this;
  }

  #autoSuspend() {
    if (
      this._state === 'closed' ||
      this._state === 'suspended' ||
      this._state === 'suspending'
    ) {
      return;
    }

    if (this.#suspendId) clearTimeout(this.#suspendId);

    this.#suspendId = setTimeout(this.#handleSuspend, Earwurm.suspendAfterMs);
  }

  #autoResume() {
    if (this._state === 'suspending') {
      this.#queuedResume = true;
      return;
    }

    if (this._state === 'suspended' || this._state === 'interrupted') {
      this.#context.resume().catch((error) => {
        this.emit('error', [
          'Failed to resume the Earwurm AudioContext.',
          getErrorMessage(error),
        ]);
      });
    }

    this.#clearSuspendResume();
  }

  #clearSuspendResume() {
    this.#queuedResume = false;

    if (this.#suspendId) {
      clearTimeout(this.#suspendId);
      this.#suspendId = 0;
    }
  }

  #setLibrary(library: Stack[]) {
    this.#library = library;
    this._keys = this.#library.map(({id}) => id);
  }

  #setState(value: ManagerState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('statechange', value);

    if (value === 'running') {
      this._unlocked = true;
      this.#autoSuspend();
    } else if (value === 'closed') {
      this._unlocked = false;
      this.#clearSuspendResume();
    }
  }

  #handleSuspend = () => {
    this.#setState('suspending');

    const resolveSuspension = () => {
      if (this._state !== 'closed') {
        // Because all of these `AudioContext > state`
        // methods are async, we need to make sure we don't
        // set `suspended` after already `closed`.
        this.#setState('suspended');
      }

      if (this.#suspendId) clearTimeout(this.#suspendId);
      this.#suspendId = 0;

      if (this.#queuedResume) this.#autoResume();
    };

    // The `state` either gets `suspended` or `interrupted`...
    // Either way, we need to update the state to `suspended`.
    this.#context.suspend().then(resolveSuspension).catch(resolveSuspension);
  };

  #handleStateChange = () => {
    // TypeScript doesn’t seem to have a way to qualify the
    // `Event` as having come from an `AudioContext`, so we
    // won’t bother using `event.target.state`.
    this.#setState(this.#context.state);
  };

  #handleStackStateChange: StackEventMap['statechange'] = (state) => {
    // We don't care about re-setting the auto-suspension each time
    // a new `Sound` is prepared... but it will do that anyways
    // since `Stack` returns to `idle` once loaded.
    if (state === 'loading') return;

    if (this.playing) {
      this.#autoResume();
    } else {
      this.#autoSuspend();
    }
  };
}
