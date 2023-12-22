import {tokens} from '../tokens';
import type {LibraryEntry, LibraryKeys} from '../types';

// TODO: Ideally we can do something like `implements Earwurm`,
// but changing all internal logic to be "dumb".
export class DummyEarwurm {
  static readonly maxStackSize = tokens.maxStackSize;
  static readonly suspendAfterMs = tokens.suspendAfterMs;

  private _volume = 1;
  private _mute = false;

  readonly unlocked = false;
  readonly state = 'closed';
  readonly playing = false;

  constructor() {
    this._volume = 1;
    this._mute = false;
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
  }

  get mute() {
    return this._mute;
  }

  set mute(value: boolean) {
    this._mute = value;
  }

  get keys() {
    return [];
  }

  get(_id: LibraryEntry['id']) {
    return undefined;
  }

  has(_id: LibraryEntry['id']) {
    return false;
  }

  unlock() {
    return this;
  }

  add(..._entries: LibraryEntry[]): LibraryKeys {
    return [];
  }

  remove(..._ids: LibraryKeys): LibraryKeys {
    return [];
  }

  stop() {
    return this;
  }

  teardown() {
    return this;
  }
}
