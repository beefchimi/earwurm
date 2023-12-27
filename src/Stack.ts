import {EmittenCommon} from 'emitten';

import {
  getErrorMessage,
  fetchAudioBuffer,
  linearRamp,
  scratchBuffer,
} from './helpers';
import {arrayShallowEquals, clamp, msToSec, secToMs} from './utilities';
import {tokens} from './tokens';

import type {
  StackId,
  StackState,
  StackError,
  StackEventMap,
  StackConfig,
  SoundId,
  SoundEventMap,
} from './types';

import {Sound} from './Sound';

export class Stack extends EmittenCommon<StackEventMap> {
  static readonly maxStackSize = tokens.maxStackSize;

  static readonly #loadError = (
    id: StackId,
    path: string,
    error: string,
  ): StackError => ({
    id,
    message: [`Failed to load: ${path}`, getErrorMessage(error)],
  });

  private _volume = 1;
  private _mute = false;
  private _keys: SoundId[] = [];
  private _state: StackState = 'idle';

  readonly #gainNode: GainNode;
  readonly #fadeSec: number = 0;
  #totalSoundsCreated = 0;
  readonly #request: StackConfig['request'];
  #queue: Sound[] = [];

  constructor(
    readonly id: StackId,
    readonly path: string,
    readonly context: AudioContext,
    readonly destination: GainNode | AudioNode,
    config?: StackConfig,
  ) {
    super();

    this._volume = config?.volume ?? this._volume;
    this.#fadeSec = config?.fadeMs ? msToSec(config.fadeMs) : this.#fadeSec;
    this.#request = config?.request ?? undefined;

    this.#gainNode = this.context.createGain();

    this.#gainNode.connect(this.destination);
    this.#gainNode.gain.setValueAtTime(this._volume, this.context.currentTime);
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    const oldVolume = this._volume;
    const newVolume = clamp(0, value, 1);

    this._volume = newVolume;

    if (oldVolume !== newVolume) {
      this.emit('volume', newVolume);
    }

    if (this._mute) return;

    const {currentTime} = this.context;
    linearRamp(
      this.#gainNode.gain,
      {from: oldVolume, to: newVolume},
      {from: currentTime, to: currentTime + this.#fadeSec},
    );
  }

  get mute() {
    return this._mute;
  }

  set mute(value: boolean) {
    if (this._mute !== value) {
      this.emit('mute', value);
    }

    this._mute = value;

    const fromValue = value ? this._volume : 0;
    const toValue = value ? 0 : this._volume;

    const {currentTime} = this.context;
    linearRamp(
      this.#gainNode.gain,
      {from: fromValue, to: toValue},
      {from: currentTime, to: currentTime + this.#fadeSec},
    );
  }

  get keys() {
    return this._keys;
  }

  get state() {
    return this._state;
  }

  get playing() {
    return this.#queue.some((sound) => sound.state === 'playing');
  }

  get(id: SoundId) {
    return this.#queue.find((sound) => sound.id === id);
  }

  has(id: SoundId) {
    return this.#queue.some((sound) => sound.id === id);
  }

  pause() {
    this.#queue.forEach((sound) => {
      sound.pause();
    });

    return this;
  }

  stop() {
    this.#queue.forEach((sound) => {
      sound.stop();
    });

    return this;
  }

  teardown() {
    this.stop();
    this.empty();

    return this;
  }

  async prepare(id?: SoundId) {
    const buffer = await this.#load();

    this.#totalSoundsCreated++;
    const newId = id?.length ? id : `${this.id}-${this.#totalSoundsCreated}`;

    return this.#create(newId, buffer);
  }

  async #load() {
    this.#setState('loading');

    const result = await fetchAudioBuffer(
      this.path,
      this.context,
      this.#request,
    ).catch((error) => {
      this.emit(
        'error',
        Stack.#loadError(this.id, this.path, getErrorMessage(error)),
      );

      return scratchBuffer(this.context);
    });

    this.#handleStateFromQueue();

    return result;
  }

  #create(id: SoundId, buffer: AudioBuffer) {
    const newSound = new Sound(id, buffer, this.context, this.#gainNode, {
      fadeMs: secToMs(this.#fadeSec),
    });

    newSound.on('state', this.#handleSoundState);
    newSound.once('ended', this.#handleSoundEnded);

    // We do not filter out identical `id` values,
    // so duplicate custom ids are possible... which means
    // identical ids could get wrongfully captured by any
    // `queue/key` filtering.
    const newQueue = [...this.#queue, newSound];

    const upperBound = newQueue.length - Stack.maxStackSize;
    const outOfBounds = upperBound > 0 ? newQueue.slice(0, upperBound) : [];
    const outOfBoundsIds = outOfBounds.map(({id}) => id);

    const filteredQueue = newQueue.filter(
      ({id}) => !outOfBoundsIds.includes(id),
    );

    outOfBounds.forEach((expiredSound) => expiredSound.stop());
    this.#setQueue(filteredQueue);

    return newSound;
  }

  #setQueue(value: Sound[]) {
    const oldKeys = [...this._keys];
    const newKeys = value.map(({id}) => id);
    const identicalKeys = arrayShallowEquals(oldKeys, newKeys);

    this.#queue = value;
    this._keys = newKeys;

    if (!identicalKeys) {
      this.emit('queue', newKeys, oldKeys);
    }
  }

  #setState(value: StackState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('state', value);
  }

  readonly #handleStateFromQueue = () => {
    this.#setState(this.playing ? 'playing' : 'idle');
  };

  readonly #handleSoundState: SoundEventMap['state'] = (_current) => {
    this.#handleStateFromQueue();
  };

  readonly #handleSoundEnded: SoundEventMap['ended'] = (event) => {
    this.#setQueue(this.#queue.filter(({id}) => id !== event.id));
    // We only set `stopping` state when `.stop()` is called.
    // There is no `state` change specifically for "ended".
    this.#handleStateFromQueue();
  };
}
