import {EmittenCommon} from 'emitten';

import {clamp, msToSec} from './utilities';
import {tokens} from './tokens';
import type {SoundId, SoundState, SoundEventMap, SoundConfig} from './types';

export class Sound extends EmittenCommon<SoundEventMap> {
  // "Readonly accessor" properties
  private _volume = 1;
  private _mute = false;
  private _state: SoundState = 'created';

  // "True private" properties
  readonly #source: AudioBufferSourceNode;
  readonly #gainNode: GainNode;
  readonly #fadeSec: number = 0;
  #started = false;

  constructor(
    readonly id: SoundId,
    readonly buffer: AudioBuffer,
    readonly context: AudioContext,
    readonly destination: GainNode | AudioNode,
    config?: SoundConfig,
  ) {
    super();

    this._volume = config?.volume ?? this._volume;
    this.#fadeSec = config?.fadeMs ? msToSec(config.fadeMs) : this.#fadeSec;

    this.#gainNode = this.context.createGain();
    this.#source = this.context.createBufferSource();
    this.#source.buffer = buffer;

    this.#source.connect(this.#gainNode).connect(this.destination);
    this.#gainNode.gain.setValueAtTime(this._volume, this.context.currentTime);

    // The `ended` event is fired either when the sound has played its full duration,
    // or the `.stop()` method has been called.
    this.#source.addEventListener('ended', this.#handleEnded, {once: true});
  }

  get volume() {
    return this._volume;
  }

  set volume(value: number) {
    const oldVolume = this._volume;
    const newVolume = clamp({preference: value, min: 0, max: 1});

    this._volume = newVolume;

    if (oldVolume !== newVolume) {
      this.emit('volume', newVolume);
    }

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
    if (this._mute !== value) {
      this.emit('mute', value);
    }

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
    if (!this.#started) {
      this.#source.start();
      this.#started = true;
    }

    if (this._state === 'paused') {
      this.#source.playbackRate.value = 1;
      this.mute = false;
    }

    this.#setState('playing');

    return this;
  }

  pause() {
    if (this._state === 'paused') return this;

    // There is no `pause/resume` API for a `AudioBufferSourceNode`.
    // Lowering the `playbackRate` isn't ideal as technically the
    // audio is still playing in the background and using resources.
    // https://github.com/WebAudio/web-audio-api-v2/issues/105
    this.#source.playbackRate.value = tokens.minPlaybackRate;
    this.mute = true;

    this.#setState('paused');

    return this;
  }

  stop() {
    this.#setState('stopping');

    if (this.#started) {
      this.#source.stop();
    } else {
      // Required to manually emit the `ended` event for "un-started" sounds.
      this.#handleEnded();
    }

    return this;
  }

  #setState(value: SoundState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('state', value);
  }

  readonly #handleEnded = () => {
    // Intentionally not setting `stopping` state here,
    // but we may want to consider a "ending" state instead.
    this.emit('ended', {
      id: this.id,
      source: this.#source,
      neverStarted: !this.#started,
    });

    // This needs to happen AFTER our artifical `ended` event is emitted.
    // Otherwise, the native `ended` event may not be called in time
    // after triggering `source.stop()`.
    this.#source.disconnect();
    this.empty();
  };
}
