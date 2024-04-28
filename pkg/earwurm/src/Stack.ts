import {arrayShallowEquals, clamp, getErrorMessage} from 'beeftools';
import {EmittenCommon} from 'emitten';
import {fetchAudioBuffer, linearRamp, scratchBuffer} from '@earwurm/helpers';

import {Sound} from './Sound';
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

export class Stack extends EmittenCommon<StackEventMap> {
  static readonly #loadError = (
    id: StackId,
    path: string,
    error: string,
  ): StackError => ({
    id,
    message: [`Failed to load: ${path}`, getErrorMessage(error)],
  });

  private _vol = 1;
  private _mute = false;
  private _trans = false;
  private _keys: SoundId[] = [];
  private _state: StackState = 'idle';

  readonly #gainNode: GainNode;
  readonly #request: StackConfig['request'];

  #totalSoundsCreated = 0;
  #queue: Sound[] = [];

  constructor(
    readonly id: StackId,
    readonly path: string,
    readonly context: AudioContext,
    readonly destination: GainNode | AudioNode,
    config?: StackConfig,
  ) {
    super();

    this._vol = config?.volume ?? this._vol;
    this._trans = Boolean(config?.transitions);
    this.#request = config?.request ?? undefined;

    this.#gainNode = this.context.createGain();

    this.#gainNode.connect(this.destination);
    this.#gainNode.gain.setValueAtTime(this._vol, this.context.currentTime);
  }

  private get transDuration() {
    return this._trans ? tokens.transitionSec : 0;
  }

  get transitions() {
    return this._trans;
  }

  set transitions(value: boolean) {
    this._trans = value;

    this.#queue.forEach((sound) => {
      sound.transitions = value;
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

    const {currentTime} = this.context;
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

    const {currentTime} = this.context;
    linearRamp(
      this.#gainNode.gain,
      {from: fromValue, to: toValue},
      {from: currentTime, to: currentTime + this.transDuration},
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
    this.#queue.forEach((sound) => sound.pause());
    return this;
  }

  stop() {
    this.#queue.forEach((sound) => sound.stop());
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
      transitions: this._trans,
    });

    newSound.on('state', this.#handleSoundState);
    newSound.once('ended', this.#handleSoundEnded);

    // TODO: We do not filter out identical `id` values,
    // so duplicate custom ids are possible... which means
    // identical ids could get wrongfully captured by any
    // `queue/key` filtering.
    const newQueue = [...this.#queue, newSound];

    const upperBound = newQueue.length - tokens.maxStackSize;
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

    if (!identicalKeys) this.emit('queue', newKeys, oldKeys);
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
    // There is an `ending` value, but it is redundant with the `ended` event.
    this.#handleStateFromQueue();
  };
}
