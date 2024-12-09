import {arrayEquals, clamp, getErrorMessage} from 'beeftools';
import {EmittenCommon} from 'emitten';
import {linearRamp, unlockAudioContext} from '@earwurm/helpers';

import {Stack} from './Stack';
import {tokens} from './tokens';
import type {
  LibraryEntry,
  ManagerConfig,
  ManagerEventMap,
  ManagerState,
  StackEventMap,
  StackId,
} from './types';

export class Earwurm extends EmittenCommon<ManagerEventMap> {
  readonly #context = new AudioContext();
  readonly #gainNode = this.#context.createGain();
  readonly #request: ManagerConfig['request'];

  #library: Stack[] = [];

  private _vol = 1;
  private _mute = false;
  private _trans = false;
  private _playing = false;
  private _keys: StackId[] = [];

  // If the `AudioContext` is `running` upon initialization,
  // then it should be safe to mark audio as “unlocked”.
  private _state: ManagerState = this.#context.state || 'suspended';
  private _unlocked = this.#context.state === 'running';

  constructor(config?: ManagerConfig) {
    super();

    this._vol = config?.volume ?? this._vol;
    this._trans = Boolean(config?.transitions);
    this.#request = config?.request ?? undefined;

    this.#gainNode.connect(this.#context.destination);
    this.#gainNode.gain.setValueAtTime(this._vol, this.#context.currentTime);

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

      // Only skip updating the `Stack` if both `id + path` are the same.
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

  resume() {
    if (this._state === 'suspended' || this._state === 'interrupted') {
      this.#context.resume().catch((error) => {
        this.emit('error', [tokens.error.resume, getErrorMessage(error)]);
      });
    }

    return this;
  }

  suspend() {
    if (
      this._state === 'closed'
      || this._state === 'suspended'
      || this._state === 'suspending'
    ) {
      return this;
    }

    this.#setState('suspending');

    const resolveSuspension = () => {
      // Because all of these `AudioContext > state`
      // methods are async, we need to make sure we don't
      // set `suspended` after already `closed`.
      if (this._state === 'closed') return;
      this.#setState('suspended');
    };

    this.#context
      .suspend()
      .then(resolveSuspension)
      .catch((error) => {
        // The `state` either gets `suspended` or `interrupted`...
        // Either way, we need to update the state to `suspended`,
        // so we call `resolveSuspension()` even when it encounters an error.
        resolveSuspension();
        this.emit('error', [tokens.error.suspend, getErrorMessage(error)]);
      });

    return this;
  }

  stop() {
    this.#library.forEach((stack) => stack.stop());
    this.suspend();

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

  #setLibrary(library: Stack[]) {
    const oldKeys = [...this._keys];
    const newKeys = library.map(({id}) => id);
    const identicalKeys = arrayEquals(oldKeys, newKeys);

    this.#library = library;
    this._keys = newKeys;

    if (!identicalKeys) this.emit('library', newKeys, oldKeys);
    if (newKeys.length === 0) this.suspend();
  }

  #setState(value: ManagerState) {
    if (this._state === value) return;

    this._state = value;

    if (value === 'running') {
      this._unlocked = true;
    }
    // TODO: This should not be broken onto a separate line.
    else if (value === 'closed') {
      this._unlocked = false;
    }

    this.emit('state', value);
  }

  readonly #handleStateChange = () => {
    // TypeScript doesn’t seem to have a way to qualify the
    // `Event` as having come from an `AudioContext`, so we
    // won’t bother using `event.target.state`.
    this.#setState(this.#context.state);
  };

  readonly #handleStackState: StackEventMap['state'] = (_current) => {
    const isPlaying = this.playing;

    if (isPlaying === this._playing) return;
    if (isPlaying) this.resume();

    this._playing = isPlaying;
    this.emit('play', isPlaying);
  };
}
