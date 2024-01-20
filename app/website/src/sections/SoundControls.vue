<script setup lang="ts">
import type {SynthType} from '@/types';
import {useSound} from '@/store';
import {MotionSlideReveal, ProgressBar} from '@/primitives';
import {
  IconAction,
  IndexAction,
  LabelAction,
  SpeedSlider,
  VolumeSound,
} from '@/components';

export interface SoundControlsProps {
  id: string;
  stackId: SynthType;
  order: number;
}

const {id, stackId} = defineProps<SoundControlsProps>();

const {
  volume,
  mute,
  progress,
  loop,
  paused,
  indexPressed,
  toggleIndexPressed,
  teardown,
  changeVolume,
  toggleMute,
  toggleLoop,
  togglePause,
  initSound,
  getSpeedRef,
} = useSound(id, stackId);

const speedRef = getSpeedRef();

initSound();
</script>

<template>
  <div :id="id" class="SoundControls collapsed-border-grid">
    <div class="collapsed-border-row">
      <IndexAction
        :index="order"
        :ally="
          indexPressed ? 'Cancel removal queue' : 'Queue this Sound for removal'
        "
        :pressed="indexPressed"
        @action="toggleIndexPressed"
      />

      <div class="ProgressBarWrapper">
        <!--
          TODO: Once we support `seek()`, this will
           need to be another <InputRange /> component.
        -->
        <ProgressBar
          id="SeekProgress"
          :value="progress"
          :speed="paused ? undefined : speedRef"
        />

        <MotionSlideReveal>
          <div v-if="indexPressed" class="RemoveSoundWrapper">
            <LabelAction
              label="Remove Sound"
              a11y="Remove this Sound from the Stack"
              :disabled="!indexPressed"
              @action="teardown"
            />
          </div>
        </MotionSlideReveal>
      </div>
    </div>

    <div class="collapsed-border-row">
      <IconAction
        icon="unmuted"
        icon-pressed="muted"
        :a11y="`${mute ? 'Unmute' : 'Mute'} this Sound`"
        :pressed="mute"
        @action="toggleMute"
      />
      <VolumeSound
        id="SoundVolumeSlider"
        :value="volume"
        :disabled="mute"
        @change="changeVolume"
      />
    </div>

    <div class="collapsed-border-row">
      <IconAction icon="speed" a11y="" pressed pressed-style disabled />
      <!--
      <IconAction
        icon="pitch"
        a11y=""
        @action=""
      />
      -->

      <SpeedSlider id="SoundSpeedSlider" v-model="speedRef" />

      <IconAction
        icon="loop"
        icon-pressed="once"
        :a11y="`${loop ? 'Disable' : 'Enable'} infinite looping`"
        :pressed="loop"
        @action="toggleLoop"
      />

      <!--
      <IconAction
        icon="reverse"
        icon-pressed="forward"
        :a11y="reversed ? 'Restore Sound direction' : 'Reverse the Sound direction'"
        :pressed="reversed"
        @action="toggleReverse"
      />
      -->

      <IconAction
        icon="pause"
        icon-pressed="play"
        :a11y="`${paused ? 'Play' : 'Pause'} this Sound`"
        :pressed="paused"
        @action="togglePause"
      />
    </div>
  </div>
</template>

<style scoped>
.SoundControls {
}

.ProgressBarWrapper {
  position: relative;
  flex: 1 1 auto;
}

.RemoveSoundWrapper {
  display: grid;
  z-index: 1;
  position: absolute;
  inset: var(--app-border-width);
}
</style>
