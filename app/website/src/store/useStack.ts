import {computed, ref, watch} from 'vue';
import type {StackEventMap} from 'earwurm';

import type {SynthType} from '@/types';
import {useEarwurmStore} from './useEarwurmStore';

const {addStack, manager} = useEarwurmStore();

function getStack(id: SynthType) {
  // Using this simple get function, instead of alternatives like:
  // const stack = reactive({instance: manager.get(id)});
  // const stack = computed(() => activeStacks.value.includes(id) ? manager.get(id) : undefined);

  return manager.get(id);
}

export function useStack(id: SynthType) {
  const hasStackRef = ref(manager.has(id));
  const stackKeysRef = ref(getStack(id)?.keys ?? []);

  const loadedRef = ref(false);
  const maxReached = computed(() => stackKeysRef.value.length >= 4);

  // Initializing refs to default `Stack` values.
  // Unable to use `stack.volume` because it might not exist yet.
  const volumeRef = ref(1);
  const muteRef = ref(false);

  ///
  /// Subscriptions

  const handleQueueChange: StackEventMap['queue'] = (newKeys) => {
    stackKeysRef.value = newKeys;
  };

  const handleMuteChange: StackEventMap['mute'] = (muted) => {
    muteRef.value = muted;
  };

  ///
  /// Teardown

  const teardownPressedRef = ref(false);

  function resetState() {
    // If we ever change the design to use a different component
    // for `Stack un-initialized` and `Stack initialized`...
    // then we can remove all of this `reset` logic.
    volumeRef.value = 1;
    muteRef.value = false;
    hasStackRef.value = manager.has(id);

    // TODO: Investigate why `.on('queue')` does not
    // get called when we `remove > teardown`.
    stackKeysRef.value = [];
    teardownPressedRef.value = false;
  }

  function toggleTeardownPressed() {
    teardownPressedRef.value = !teardownPressedRef.value;
  }

  function teardown() {
    manager.remove(id);
    resetState();
  }

  ///
  /// Mutations

  // Using `watch` instead of `stack.on('volume')`
  // as it makes more sense with `v-model`.
  watch(volumeRef, (incomingVolume) => {
    const stack = getStack(id);
    if (!stack) return;

    stack.volume = incomingVolume;
  });

  function toggleMute() {
    const stack = getStack(id);
    if (!stack) return;
    stack.mute = !stack.mute;
  }

  ///
  /// Actions

  async function addSound() {
    const stack = getStack(id);
    if (!stack || maxReached.value) return;

    await stack.prepare();

    loadedRef.value = true;
    stackKeysRef.value = stack.keys;
  }

  function initStack() {
    addStack(id);

    const stack = getStack(id);
    if (!stack) return;

    hasStackRef.value = manager.has(id);
    stack.on('queue', handleQueueChange);
    stack.on('mute', handleMuteChange);

    addSound();
  }

  return {
    hasStack: computed(() => hasStackRef.value),
    stackKeys: computed(() => stackKeysRef.value),
    loaded: computed(() => loadedRef.value),
    maxReached,

    volume: computed(() => volumeRef.value),
    mute: computed(() => muteRef.value),

    teardownPressed: computed(() => teardownPressedRef.value),
    toggleTeardownPressed,
    teardown,

    toggleMute,

    addSound,
    initStack,

    getVolumeRef() {
      // Necessary for v-modal + watch patterns.
      return volumeRef;
    },
  };
}
