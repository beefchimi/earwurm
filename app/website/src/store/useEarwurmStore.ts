import {computed, ref, watch} from 'vue';
import {Earwurm} from 'earwurm';

import type {SynthEntries, SynthType} from '@/types';
import {filterSynthValues} from '@/helpers';
import {useMetronome} from '@/hooks';
import {audioPath} from '@/assets/audio';

// Store design based off:
// https://vueschool.io/articles/vuejs-tutorials/state-management-with-composition-api/
// https://vueschool.io/articles/vuejs-tutorials/home-rolled-store-with-the-vue-js-composition-api/

const audioLibrary: SynthEntries = [
  {id: 'strk', path: audioPath.track1},
  {id: 'clb1', path: audioPath.track2},
  {id: 'clb2', path: audioPath.track3},
  {id: 'hhts', path: audioPath.track4},
  {id: 'rmbl', path: audioPath.track5},
  {id: 'blck', path: audioPath.track6},
];

export const manager = new Earwurm();
const metroInstance = useMetronome();

const metronomeRef = ref(false);
const transitionsRef = ref(manager.transitions);
const managerVolumeRef = ref(manager.volume);
const managerMuteRef = ref(manager.mute);

const activeStacksRef = ref(filterSynthValues(manager.keys));

manager.on('library', (newKeys) => {
  activeStacksRef.value = filterSynthValues(newKeys);
});

watch(managerVolumeRef, (incomingVolume) => {
  manager.volume = incomingVolume;
  metroInstance.setVolume(manager.volume);
});

document.addEventListener('visibilitychange', () => {
  // Pause all playing sounds when the device is interrupted.
  if (document.hidden && manager.state === 'interrupted') {
    activeStacksRef.value.forEach((stackId) => manager.get(stackId)?.pause());
  }
});

export function useEarwurmStore() {
  return {
    audioLibrary,
    manager,

    ///
    /// Computed state

    metronome: computed(() => metronomeRef.value),
    transitions: computed(() => transitionsRef.value),
    managerVolume: computed(() => managerVolumeRef.value),
    managerMute: computed(() => managerMuteRef.value),
    activeStacks: computed(() => activeStacksRef.value),

    ///
    /// Getters

    getManagerVolumeRef() {
      // Necessary for v-modal... ideally only exposing `readonly` props.
      return managerVolumeRef;
    },

    ///
    /// Setters

    toggleMetronome() {
      metronomeRef.value = !metronomeRef.value;

      if (metronomeRef.value) {
        metroInstance.start();
      }
      else {
        metroInstance.stop();
      }
    },
    toggleTransitions() {
      transitionsRef.value = !transitionsRef.value;
      manager.transitions = transitionsRef.value;
    },
    setManagerVolume(level: number) {
      managerVolumeRef.value = level;
      manager.volume = managerVolumeRef.value;
      metroInstance.setVolume(managerVolumeRef.value);
    },
    toggleManagerMute() {
      const newValue = !managerMuteRef.value;

      managerMuteRef.value = newValue;
      manager.mute = newValue;
      metroInstance.setMute(newValue);
    },

    ///
    /// Mutations

    // Instead of an arrow function, we could use `this: void`.
    addStack: (id: SynthType) => {
      if (manager.get(id)) return;

      const stackEntry = audioLibrary.find((entry) => entry.id === id);
      if (stackEntry) manager.add(stackEntry);
    },
  };
}
