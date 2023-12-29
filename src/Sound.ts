import {EmittenCommon} from 'emitten';

import {linearRamp} from './helpers';
import {clamp, msToSec, progressPercentage} from './utilities';
import {tokens} from './tokens';
import type {
  SoundId,
  SoundState,
  SoundEventMap,
  SoundProgressEvent,
  SoundConfig,
} from './types';

export class Sound extends EmittenCommon<SoundEventMap> {
  // "Readonly accessor" properties
  private _volume = 1;
  private _mute = false;
  private _speed = 1;
  private _state: SoundState = 'created';

  // "True private" properties
  readonly #source: AudioBufferSourceNode;
  readonly #gainNode: GainNode;
  readonly #fadeSec: number = 0;

  readonly #progress = {
    elapsed: 0,
    remaining: 0,
    percentage: 0,
    iterations: 0,
  };

  #intervalId = 0;
  #timestamp = 0;
  #elapsedSnapshot = 0;
  #hasStarted = false;

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
    this.#progress.remaining = this.#source.buffer.duration;

    // The `ended` event is fired either when the sound has played its full duration,
    // or the `.stop()` method has been called.
    this.#source.addEventListener('ended', this.#handleEnded, {once: true});
  }

  private get hasProgressSub() {
    return this.activeEvents.some((event) => event === 'progress');
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

  get speed() {
    return this._speed;
  }

  set speed(value: number) {
    const oldSpeed = this._speed;
    const newSpeed = clamp(tokens.minSpeed, value, tokens.maxSpeed);

    if (oldSpeed === newSpeed) return;

    this._speed = newSpeed;
    this.emit('speed', newSpeed);

    // Must return if `paused`, because the way we currently
    // "pause" is by slowing `playbackRate` to a halt.
    if (this._state === 'paused') return;

    if (this._state !== 'playing') {
      this.#source.playbackRate.value = newSpeed;
      return;
    }

    const {currentTime} = this.context;
    this.#timestamp = Math.max(currentTime, tokens.minStartTime);
    this.#elapsedSnapshot = this.#progress.elapsed;

    linearRamp(
      this.#source.playbackRate,
      {from: oldSpeed, to: newSpeed},
      {from: currentTime, to: currentTime},
      // TODO: Not transitioning to new `speed` for now...
      // this will be complicated given our `progress` calculations.
      // {from: currentTime, to: currentTime + this.#fadeSec},
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

  get progress(): SoundProgressEvent {
    if (!this.#hasStarted) return {...this.#progress};

    // When combining `speed + pause + looping`, we can end up with
    // an accumulative loss of precision. The `progress` calculations
    // can end up behind the actual play position of the sound.
    // Not yet sure how to resolve this.
    this.#incrementLoop();

    const timeSince =
      Math.max(this.context.currentTime - this.#timestamp, 0) * this.speed;

    this.#progress.elapsed = clamp(
      0,
      this.#elapsedSnapshot + timeSince,
      this.duration,
    );
    this.#progress.remaining = this.duration - this.#progress.elapsed;
    this.#progress.percentage = clamp(
      0,
      progressPercentage(this.#progress.elapsed, this.duration),
      100,
    );

    return {...this.#progress};
  }

  get state() {
    return this._state;
  }

  play() {
    if (!this.#hasStarted) {
      this.#source.start();
      this.#hasStarted = true;
    }

    if (this._state === 'paused') {
      // Restoring directly to `playbackRate` instead of `speed`.
      this.#source.playbackRate.value = this._speed;
    }

    this.#timestamp = Math.max(this.context.currentTime, tokens.minStartTime);
    this.#elapsedSnapshot = this.#progress.elapsed;

    this.#setState('playing');

    return this;
  }

  pause() {
    // There is no `pause/resume` API for a `AudioBufferSourceNode`.
    // To solve this, we leverage `playbackRate`.
    // https://github.com/WebAudio/web-audio-api-v2/issues/105
    if (this._state !== 'playing') return this;

    // Directly setting `playbackRate` instead of `speed`,
    // as we do not want to trigger an `event` or `ramp`.
    this.#source.playbackRate.value = tokens.pauseSpeed;
    this.#setState('paused');

    // TODO: We will need to "fade to silent" if using
    // `transitions`... but not `trigger` a volume event.
    return this;
  }

  stop() {
    // This state is useful to distinguish between
    // an explicit "stop" and a natural "end".
    this.#setState('stopping');

    if (this.#hasStarted) this.#source.stop();
    // Required to manually emit the `ended` event for "un-started" sounds.
    else this.#handleEnded();

    return this;
  }

  #setState(value: SoundState) {
    if (this._state === value) return;

    this._state = value;
    this.emit('state', value);

    if (value === 'playing') {
      this.#intervalId = this.hasProgressSub
        ? requestAnimationFrame(this.#handleInterval)
        : 0;
    } else {
      cancelAnimationFrame(this.#intervalId);
      this.#intervalId = 0;

      // TODO: We may not get a final `100%` value, as
      // `ended > empty()` might be clearing subscriptions
      // before they get a chance to execute one last time.
      if (this.hasProgressSub) this.#updateProgress();
    }
  }

  #incrementLoop() {
    if (!this.loop) return;

    const fullyElapsed = this.#progress.elapsed === this.duration;
    const noTimeRemaining = this.#progress.remaining === 0;
    const progressDone = this.#progress.percentage === 100;

    if (fullyElapsed || noTimeRemaining || progressDone) {
      this.#progress.elapsed = 0;
      this.#progress.remaining = this.duration;
      this.#progress.percentage = 0;
      this.#progress.iterations++;

      this.#timestamp = this.context.currentTime;
      this.#elapsedSnapshot = 0;
    }
  }

  #updateProgress() {
    this.emit('progress', this.progress);
  }

  readonly #handleInterval = (_timestamp = 0) => {
    this.#updateProgress();
    // Recursive call allows for a loop per-animation-frame.
    this.#intervalId = requestAnimationFrame(this.#handleInterval);
  };

  readonly #handleEnded = () => {
    this.#setState('ending');

    this.emit('ended', {
      id: this.id,
      source: this.#source,
      neverStarted: !this.#hasStarted,
    });

    // This needs to happen AFTER our artifical `ended` event is emitted.
    // Otherwise, the native `ended` event may not be called in time
    // after triggering `source.stop()`.
    this.#source.disconnect();
    this.empty();
  };
}
