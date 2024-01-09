import {EmittenCommon} from 'emitten';

import {getErrorMessage, linearRamp, unlockAudioContext} from '../../helpers';
import {arrayShallowEquals, clamp} from '../../utilities';
import type {TimeoutId} from '../../types';

import {Stack} from './Stack';

import {tokens} from './tokens';
import type {
  ManagerState,
  ManagerEventMap,
  ManagerConfig,
  LibraryEntry,
  StackId,
  StackEventMap,
} from './types';

export class Earwurm extends EmittenCommon<ManagerEventMap> {
  private _vol = 1;
  private _mute = false;
  private _trans = false;
  private _keys: StackId[] = [];
  private _state: ManagerState = 'suspended';

  readonly #context = new AudioContext();
  readonly #gainNode = this.#context.createGain();
  readonly #request: ManagerConfig['request'];

  #library: Stack[] = [];
  #suspendId: TimeoutId = 0;
  #queuedResume = false;

  // If the `AudioContext` is `running` upon initialization,
  // then it should be safe to mark audio as “unlocked”.
  private _unlocked = this.#context.state === 'running';

  constructor(config?: ManagerConfig) {
    super();

    this._vol = config?.volume ?? this._vol;
    this._trans = Boolean(config?.transitions);
    this.#request = config?.request ?? undefined;

    this.#gainNode.connect(this.#context.destination);
    this.#gainNode.gain.setValueAtTime(this._vol, this.#context.currentTime);

    if (this._unlocked) this.#autoSuspend();

    this.#context.addEventListener('statechange', this.#handleStateChange);
  }

  private get transDuration() {
    return this._trans ? tokens.transitionSec : 0;
  }

  get transitions() {
    return this._trans;
  }

  set transitions(value: boolean) {
    this._trans = value;

    this.#library.forEach((stack) => {
      stack.transitions = value;
    });
  }

  get volume() {
    return this._vol;
  }

  set volume(value: number) {
    const oldVolume = this._vol;
    const newVolume = clamp(0, value, 1);

    if (oldVolume === newVolume) return;

    this._vol = newVolume;
    this.emit('volume', newVolume);

    if (this._mute) return;

    const {currentTime} = this.#context;
    linearRamp(
      this.#gainNode.gain,
      {from: oldVolume, to: newVolume},
      {from: currentTime, to: currentTime + this.transDuration},
    );
  }

  get mute() {
    return this._mute;
  }

  set mute(value: boolean) {
    if (this._mute === value) return;

    this._mute = value;
    this.emit('mute', value);

    const fromValue = value ? this._vol : 0;
    const toValue = value ? 0 : this._vol;

    const {currentTime} = this.#context;
    linearRamp(
      this.#gainNode.gain,
      {from: fromValue, to: toValue},
      {from: currentTime, to: currentTime + this.transDuration},
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
    const newKeys: StackId[] = [];

    const newStacks = entries.reduce<Stack[]>((collection, {id, path}) => {
      const existingStack = this.get(id);
      const identicalStack = existingStack?.path === path;

      if (identicalStack) return collection;

      newKeys.push(id);

      const newStack = new Stack(id, path, this.#context, this.#gainNode, {
        transitions: this._trans,
        request: this.#request,
      });

      newStack.on('state', this.#handleStackState);

      return [...collection, newStack];
    }, []);

    const replacedKeys = this.#library.reduce<StackId[]>(
      (collection, {id}) =>
        newKeys.includes(id) ? [...collection, id] : collection,
      [],
    );

    if (replacedKeys.length) this.remove(...replacedKeys);
    this.#setLibrary([...this.#library, ...newStacks]);

    return newKeys;
  }

  remove(...ids: StackId[]) {
    const removedKeys: StackId[] = [];

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
        this.emit('error', [tokens.error.close, getErrorMessage(error)]);
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

    this.#suspendId = setTimeout(this.#handleSuspend, tokens.suspendAfterMs);
  }

  #autoResume() {
    if (this._state === 'suspending') {
      this.#queuedResume = true;
      return;
    }

    if (this._state === 'suspended' || this._state === 'interrupted') {
      this.#context.resume().catch((error) => {
        this.emit('error', [tokens.error.resume, getErrorMessage(error)]);
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
    const oldKeys = [...this._keys];
    const newKeys = library.map(({id}) => id);
    const identicalKeys = arrayShallowEquals(oldKeys, newKeys);

    this.#library = library;
    this._keys = newKeys;

    if (!identicalKeys) this.emit('library', newKeys, oldKeys);
  }

  #setState(value: ManagerState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('state', value);

    if (value === 'running') {
      this._unlocked = true;
      this.#autoSuspend();
    } else if (value === 'closed') {
      this._unlocked = false;
      this.#clearSuspendResume();
    }
  }

  readonly #handleSuspend = () => {
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

  readonly #handleStateChange = () => {
    // TypeScript doesn’t seem to have a way to qualify the
    // `Event` as having come from an `AudioContext`, so we
    // won’t bother using `event.target.state`.
    this.#setState(this.#context.state);
  };

  readonly #handleStackState: StackEventMap['state'] = (current) => {
    // We don't care about re-setting the auto-suspension each time
    // a new `Sound` is prepared... but it will do that anyways
    // since `Stack` returns to `idle` once loaded.
    if (current === 'loading') return;

    if (this.playing) {
      this.#autoResume();
    } else {
      this.#autoSuspend();
    }
  };
}
