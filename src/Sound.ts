import {EmittenCommon} from 'emitten';

import {clamp, msToSec} from './utilities';
import type {SoundId, SoundState, SoundEventMap, SoundConfig} from './types';

export class Sound extends EmittenCommon<SoundEventMap> {
  // "Readonly accessor" properties
  private _volume = 1;
  private _mute = false;
  private _state: SoundState = 'created';

  // "True private" properties
  #source: AudioBufferSourceNode;
  #gainNode: GainNode;
  #outputNode: AudioNode;
  #fadeSec = 0;

  constructor(
    readonly id: SoundId,
    readonly buffer: AudioBuffer,
    readonly context: AudioContext,
    readonly destination: AudioNode,
    config?: SoundConfig,
  ) {
    super();

    this._volume = config?.volume ?? this._volume;
    this.#fadeSec = config?.fadeMs ? msToSec(config.fadeMs) : this.#fadeSec;

    this.#source = this.context.createBufferSource();
    this.#gainNode = this.context.createGain();
    this.#outputNode = this.#gainNode.connect(this.destination);
    this.#source.buffer = buffer;

    this.#source.connect(this.#outputNode);
    this.#gainNode.gain.setValueAtTime(this._volume, this.context.currentTime);

    // We could `emit` a "created" event, but it wouldn't get caught
    // by any listeners, since those cannot be attached until after creation.
    this.#source.addEventListener('ended', this.#handleEnded, {once: true});
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

  get loop() {
    return this.#source.loop;
  }

  set loop(value: boolean) {
    this.#source.loop = value;
  }

  get duration() {
    return this.#source.buffer?.duration ?? 0;
  }

  get state() {
    return this._state;
  }

  play() {
    this.#source.start();
    this.#setState('playing');

    return this;
  }

  pause() {
    // There is no `pause/resume` API for a `AudioBufferSourceNode`,
    // so we may have to set `playbackRate.value = 0` instead.
    // https://github.com/WebAudio/web-audio-api-v2/issues/105

    this.#source.playbackRate.value = 0;
    this.#setState('paused');

    return this;
  }

  stop() {
    this.#setState('stopping');
    this.#source.stop();
    this.#source.disconnect();
    this.empty();

    return this;
  }

  #setState(value: SoundState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('statechange', value);
  }

  #handleEnded = () => {
    this.emit('ended', {id: this.id, source: this.#source});
  };
}
