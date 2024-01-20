import {computed, ref, watch} from 'vue';
import type {SoundId, SoundEventMap} from 'earwurm';

import type {SynthType} from '@/types';
import {useEarwurmStore} from './useEarwurmStore';

const {manager} = useEarwurmStore();

export function useSound(id: SoundId, stackId: SynthType) {
  const stack = manager.get(stackId);
  const sound = stack?.get(id);

  // Initializing refs to default `Sound` values.
  // Unable to use `sound.volume` because it might not exist yet.
  const volumeRef = ref(1);
  const muteRef = ref(false);
  const progressRef = ref(0);
  const speedRef = ref(1);
  const loopRef = ref(false);
  const pausedRef = ref(true);

  ///
  /// Subscriptions

  const handleVolumeChange: SoundEventMap['volume'] = (level) => {
    volumeRef.value = level;
  };

  const handleMuteChange: SoundEventMap['mute'] = (muted) => {
    muteRef.value = muted;
  };

  const handleProgressChange: SoundEventMap['progress'] = ({percentage}) => {
    progressRef.value = percentage;
  };

  const handleStateChange: SoundEventMap['state'] = (current) => {
    const playing = current === 'playing';
    pausedRef.value = !playing;
  };

  ///
  /// Teardown

  const indexPressedRef = ref(false);

  function toggleIndexPressed() {
    indexPressedRef.value = !indexPressedRef.value;
  }

  function teardown() {
    sound?.stop();
  }

  ///
  /// Mutations

  // Using `watch` instead of `sound.on('speed')`
  // as it makes more sense with `v-model`.
  watch(speedRef, (incomingSpeed) => {
    if (!sound) return;
    sound.speed = incomingSpeed;
  });

  function changeVolume(volume: number) {
    if (!sound) return;
    sound.volume = volume;
  }

  function toggleMute() {
    if (!sound) return;
    sound.mute = !sound.mute;
  }

  function toggleLoop() {
    if (!sound) return;

    loopRef.value = !loopRef.value;
    sound.loop = loopRef.value;
  }

  function togglePause() {
    if (!sound) return;

    if (sound.state === 'playing') {
      sound.pause();
    } else {
      sound.play();
    }
  }

  ///
  /// Actions

  function initSound() {
    if (!sound) return;

    sound.on('volume', handleVolumeChange);
    sound.on('mute', handleMuteChange);
    sound.on('progress', handleProgressChange);
    sound.on('state', handleStateChange);
  }

  ///
  /// Not implemented

  const reversedRef = ref(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function toggleReverse() {
    reversedRef.value = !reversedRef.value;
  }

  return {
    volume: computed(() => volumeRef.value),
    mute: computed(() => muteRef.value),
    progress: computed(() => progressRef.value),
    speed: computed(() => speedRef.value),
    loop: computed(() => loopRef.value),
    paused: computed(() => pausedRef.value),

    indexPressed: computed(() => indexPressedRef.value),
    toggleIndexPressed,
    teardown,

    changeVolume,
    toggleMute,
    toggleLoop,
    togglePause,

    initSound,

    getSpeedRef() {
      // Necessary for v-modal + watch patterns.
      return speedRef;
    },
  };
}
