<script setup lang="ts">
import {useBreakpointStore, useEarwurmStore} from '@/store';
import {IconAction, VolumeManager} from '@/components';

const {tablet} = useBreakpointStore();
const {
  metronome,
  transitions,
  managerMute,
  getManagerVolumeRef,
  toggleMetronome,
  toggleTransitions,
  toggleManagerMute,
} = useEarwurmStore();

const volumeRef = getManagerVolumeRef();
</script>

<template>
  <section class="ManagerControls">
    <div class="collapsed-border-row">
      <IconAction
        icon="metronome"
        :label="tablet ? 'Beat' : undefined"
        :a11y="`${metronome ? 'Disable' : 'Enable'} the metronome`"
        :pressed="metronome"
        pressed-style
        @action="toggleMetronome"
      />

      <IconAction
        icon="bolt"
        :label="tablet ? 'Fade' : undefined"
        :a11y="`${transitions ? 'Disable' : 'Enable'} audio transitions`"
        :pressed="transitions"
        pressed-style
        @action="toggleTransitions"
      />

      <IconAction
        icon="unmuted"
        icon-pressed="muted"
        :a11y="`${managerMute ? 'Unmute' : 'Mute'} all audio`"
        :pressed="managerMute"
        @action="toggleManagerMute"
      />
      <VolumeManager
        id="ManagerVolumeSlider"
        v-model="volumeRef"
        :disabled="managerMute"
      />
    </div>
  </section>
</template>

<style scoped>
.ManagerControls {
}
</style>
