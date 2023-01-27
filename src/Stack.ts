import {EmittenProtected} from 'emitten';
import type {EmittenListener} from 'emitten';

import {getErrorMessage, fetchAudioBuffer, scratchBuffer} from './helpers';
import {clamp, msToSec, secToMs} from './utilities';
import {tokens} from './tokens';

import type {
  StackId,
  StackState,
  StackEventMap,
  StackConfig,
  SoundId,
  SoundEndedEvent,
} from './types';

import {Sound} from './Sound';

export class Stack extends EmittenProtected<StackEventMap> {
  static readonly maxStackSize = tokens.maxStackSize;

  static #loadError = (
    id: StackId,
    path: string,
    error: string,
  ): StackEventMap['error'] => ({
    id,
    message: [`Failed to load: ${path}`, getErrorMessage(error)],
  });

  private _volume = 1;
  private _mute = false;
  private _keys: SoundId[] = [];
  private _state: StackState = 'idle';

  #gainNode: GainNode;
  #outputNode: AudioNode;
  #fadeSec = 0;
  #totalSoundsCreated = 0;
  #request: StackConfig['request'];
  #queue: Sound[] = [];

  constructor(
    readonly id: StackId,
    readonly path: string,
    readonly context: AudioContext,
    readonly destination: AudioNode,
    config?: StackConfig,
  ) {
    super();

    this._volume = config?.volume ?? this._volume;
    this.#fadeSec = config?.fadeMs ? msToSec(config.fadeMs) : this.#fadeSec;
    this.#request = config?.request ?? undefined;

    this.#gainNode = this.context.createGain();
    this.#outputNode = this.#gainNode.connect(this.destination);

    this.#gainNode.gain.setValueAtTime(this._volume, this.context.currentTime);
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
      .cancelScheduledValues(this.context.currentTime)
      .setValueAtTime(oldVolume, this.context.currentTime)
      .linearRampToValueAtTime(
        newVolume,
        this.context.currentTime + this.#fadeSec,
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
      .cancelScheduledValues(this.context.currentTime)
      .setValueAtTime(fromValue, this.context.currentTime)
      .linearRampToValueAtTime(
        toValue,
        this.context.currentTime + this.#fadeSec,
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
    const newId = `${this.id}-${id ?? this.#totalSoundsCreated++}`;

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
    const newSound = new Sound(id, buffer, this.context, this.#outputNode, {
      fadeMs: secToMs(this.#fadeSec),
    });

    newSound.on('statechange', this.#handleStateFromQueue);
    newSound.once('ended', this.#handleSoundEnded);

    const newQueue = [...this.#queue, newSound];
    const upperBound = newQueue.length - (Stack.maxStackSize - 1);
    const outOfBounds = upperBound > 0 ? newQueue.slice(0, upperBound) : [];

    outOfBounds.forEach((expiredSound) => {
      expiredSound.stop();
    });

    this.#setQueue(newQueue);

    return newSound;
  }

  #setQueue(value: Sound[]) {
    this.#queue = value;
    this._keys = value.map(({id}) => id);
  }

  #setState(value: StackState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('statechange', value);
  }

  #handleStateFromQueue = () => {
    this.#setState(this.playing ? 'playing' : 'idle');
  };

  #handleSoundEnded = (event?: SoundEndedEvent) => {
    // TODO: `event` should never be `undefined`.
    // This needs to be fixed within `Emitten`.
    this.#setQueue(this.#queue.filter(({id}) => id !== event?.id));
  };

  ///
  /// Emitten method exposure

  public off<TKey extends keyof StackEventMap>(
    eventName: TKey,
    listener: EmittenListener<StackEventMap[TKey]>,
  ) {
    super.off(eventName, listener);
  }

  public on<TKey extends keyof StackEventMap>(
    eventName: TKey,
    listener: EmittenListener<StackEventMap[TKey]>,
  ) {
    super.on(eventName, listener);
  }

  public once<TKey extends keyof StackEventMap>(
    eventName: TKey,
    listener: EmittenListener<StackEventMap[TKey]>,
  ) {
    super.once(eventName, listener);
  }

  public disposable<TKey extends keyof StackEventMap>(
    eventName: TKey,
    listener: EmittenListener<StackEventMap[TKey]>,
  ) {
    const result = super.disposable(eventName, listener);
    return result;
  }
}
