import {computed, ref} from 'vue';
import {clamp} from '@earwurm/utilities';

// TODO: `volume` range may actually need to be `0-100`.
const INITIAL_VOLUME = 1;
const INITIAL_MUTE = false;

const TONE_SEC = 0.2;
const MS_PER_MIN = 60 * 1000;

// TODO: Implement options.
// bpm: min=40 prefrence=100 max=218
// frequency: min=110 prefrence=440 max=880
// type: sine, triangle, square, sawtooth
const DEFAULT_BPM = 100;
const DEFAULT_FREQ = 220;
const DEFAULT_TYPE: OscillatorType = 'sine';

const globalContext = new AudioContext();

// TODO: Research how to calculate the BPM interval.
// https://math.stackexchange.com/questions/2014169/relationship-between-bpm-tempo-and-setting-a-timer-interval
export function useMetronome() {
  // TODO: This might need to consider the `globalContext`
  // becoming `suspended`, and call `.resume()` if needed.
  const initializedRef = ref(false);
  const osciallatorRef = ref<OscillatorNode>();

  const volumeRef = ref(INITIAL_VOLUME);
  const muteRef = ref(INITIAL_MUTE);
  const playingRef = ref(false);

  const intervalRef = ref(0);
  const intervalMs = computed(() => MS_PER_MIN / DEFAULT_BPM);

  const loopNode = globalContext.createGain();
  const gainNode = globalContext.createGain();

  function initMetronome() {
    if (initializedRef.value) return;

    const {destination, currentTime} = globalContext;

    loopNode.connect(gainNode);
    gainNode.connect(destination);

    loopNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.setValueAtTime(INITIAL_VOLUME, currentTime);

    initializedRef.value = true;
  }

  function startOscillator() {
    if (osciallatorRef.value) return;

    osciallatorRef.value = globalContext.createOscillator();

    osciallatorRef.value.type = DEFAULT_TYPE;
    osciallatorRef.value.frequency.value = DEFAULT_FREQ;

    osciallatorRef.value.connect(loopNode);
    osciallatorRef.value.start();
  }

  function stopOscillator() {
    if (!osciallatorRef.value) return;

    osciallatorRef.value.stop();
    osciallatorRef.value.disconnect();
    osciallatorRef.value = undefined;
  }

  function sound() {
    const {currentTime} = globalContext;
    const peakTime = currentTime + TONE_SEC / 2;
    const endTime = currentTime + TONE_SEC;

    loopNode.gain
      .cancelScheduledValues(currentTime)
      .setValueAtTime(0, currentTime)
      .linearRampToValueAtTime(1, peakTime);

    loopNode.gain
      .cancelScheduledValues(peakTime)
      .setValueAtTime(1, peakTime)
      .linearRampToValueAtTime(0, endTime);
  }

  function loop() {
    intervalRef.value = window.setInterval(sound, intervalMs.value);
  }

  return {
    volume: computed(() => volumeRef.value),
    mute: computed(() => muteRef.value),
    playing: computed(() => playingRef.value),

    setVolume(level: number) {
      const oldVolume = volumeRef.value;
      const newVolume = clamp(0, level, 1);

      if (oldVolume === newVolume) return;
      volumeRef.value = newVolume;
      if (muteRef.value) return;

      const {currentTime} = globalContext;

      gainNode.gain
        .cancelScheduledValues(currentTime)
        .setValueAtTime(oldVolume, currentTime)
        .linearRampToValueAtTime(newVolume, currentTime);
    },
    setMute(enabled: boolean) {
      if (muteRef.value === enabled) return;

      muteRef.value = enabled;

      const fromValue = enabled ? volumeRef.value : 0;
      const toValue = enabled ? 0 : volumeRef.value;

      const {currentTime} = globalContext;

      gainNode.gain
        .cancelScheduledValues(currentTime)
        .setValueAtTime(fromValue, currentTime)
        .linearRampToValueAtTime(toValue, currentTime);
    },

    start() {
      initMetronome();
      startOscillator();
      loop();

      playingRef.value = true;
    },
    stop() {
      if (!playingRef.value) return;

      stopOscillator();
      window.clearInterval(intervalRef.value);

      playingRef.value = false;
      intervalRef.value = 0;
    },
  };
}
