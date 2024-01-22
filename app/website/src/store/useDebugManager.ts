import {computed, ref} from 'vue';
import {type ManagerEventMap} from 'earwurm';

import {useEarwurmStore} from './useEarwurmStore';

type ErrorResponse = Parameters<ManagerEventMap['error']>[0];

const MAX_HISTORY_LENGTH = 44;

const {manager, activeStacks} = useEarwurmStore();

const stateHistoryRef = ref([manager.state]);
const errorHistoryRef = ref<ErrorResponse[]>([]);

// TODO: Update these to be more accurate.
// Currently, these do not update on the right events.
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

function updatePlayHistory() {
  const currentLength = playHistoryRef.value.length;

  if (manager.playing === playHistoryRef.value[currentLength - 1]) {
    return;
  }

  const newHistory = [...playHistoryRef.value, manager.playing];
  playHistoryRef.value = newHistory.slice(MAX_HISTORY_LENGTH * -1);
}

manager.on('state', (current) => {
  const newState = [...stateHistoryRef.value, current];
  stateHistoryRef.value = newState.slice(MAX_HISTORY_LENGTH * -1);

  updateUnlockHistory();
  updatePlayHistory();
});

manager.on('library', () => {
  updateUnlockHistory();
  updatePlayHistory();
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
