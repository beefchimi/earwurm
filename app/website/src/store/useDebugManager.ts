import {computed, ref} from 'vue';
import {type ManagerEventMap} from 'earwurm';

import {useEarwurmStore} from './useEarwurmStore';

type ErrorResponse = Parameters<ManagerEventMap['error']>[0];

const MAX_HISTORY_LENGTH = 44;

// TODO: Consider enabling a auto-suspension option.
// import {clamp, timeMeasurement} from '@earwurm/utilities';
// const safeAutoSuspend = clamp(0, autoSuspend, timeMeasurement.msPerMin);

const {manager, activeStacks} = useEarwurmStore();

const stateHistoryRef = ref([manager.state]);
const errorHistoryRef = ref<ErrorResponse[]>([]);
const unlockHistoryRef = ref([manager.unlocked]);
const playHistoryRef = ref([manager.playing]);

function updateUnlockHistory() {
  const currentLength = unlockHistoryRef.value.length;

  if (manager.unlocked === unlockHistoryRef.value[currentLength - 1]) {
    return;
  }

  const newHistory = [...unlockHistoryRef.value, manager.unlocked];
  unlockHistoryRef.value = newHistory.slice(MAX_HISTORY_LENGTH * -1);
}

manager.on('state', (current) => {
  const newStateHistory = [...stateHistoryRef.value, current];
  stateHistoryRef.value = newStateHistory.slice(MAX_HISTORY_LENGTH * -1);

  updateUnlockHistory();
});

manager.on('play', (active) => {
  const newPlayHistory = [...playHistoryRef.value, active];
  playHistoryRef.value = newPlayHistory.slice(MAX_HISTORY_LENGTH * -1);
});

manager.on('error', (response) => {
  errorHistoryRef.value = [...errorHistoryRef.value, response];
});

export function useDebugManager() {
  return {
    activeStacks,
    currentState: computed(
      () => stateHistoryRef.value[stateHistoryRef.value.length - 1],
    ),
    stateHistory: computed(() => stateHistoryRef.value),
    errorHistory: computed(() => errorHistoryRef.value),
    unlockHistory: computed(() => unlockHistoryRef.value),
    playHistory: computed(() => playHistoryRef.value),
  };
}
