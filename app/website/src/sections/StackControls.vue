<script setup lang="ts">
import {computed} from 'vue';

import type {SynthType} from '@/types';
import {useStack} from '@/store';
import {MotionSlideReveal, ProgressBar} from '@/primitives';
import {
  IconAction,
  LabelAction,
  StackLabel,
  TeardownAction,
  VolumeStack,
} from '@/components';

import SoundControls from './SoundControls.vue';

export interface StackControlsProps {
  id: SynthType;
}

const {id} = defineProps<StackControlsProps>();

const {
  hasStack,
  stackKeys,
  loaded,
  maxReached,
  mute,
  teardownPressed,
  toggleTeardownPressed,
  teardown,
  toggleMute,
  addSound,
  initStack,
  getVolumeRef,
} = useStack(id);

const volumeRef = getVolumeRef();
const preparing = computed(() => hasStack.value && !loaded.value);
</script>

<template>
  <article :id="`Stack-${id}`" class="StackControls collapsed-border-grid">
    <div class="collapsed-border-row">
      <StackLabel :label="id" :populated="hasStack && loaded" truncate />

      <div v-if="hasStack" class="PopulatedBar collapsed-border-row">
        <div class="VolumeStackWrapper collapsed-border-row">
          <IconAction
            icon="unmuted"
            icon-pressed="muted"
            :a11y="`${mute ? 'Unmute' : 'Mute'} this Stack`"
            :disabled="teardownPressed"
            :pressed="mute"
            @action="toggleMute"
          />
          <VolumeStack
            id="StackVolumeSlider"
            v-model="volumeRef"
            :disabled="mute || teardownPressed"
          />

          <MotionSlideReveal reverse>
            <div v-if="teardownPressed" class="TeardownStackWrapper">
              <LabelAction
                label="Teardown"
                a11y="Remove all Sounds from this Stack"
                :disabled="!teardownPressed"
                @action="teardown"
              />
            </div>
          </MotionSlideReveal>
        </div>

        <TeardownAction
          a11y="Teardown the entire Stack"
          :pressed="teardownPressed"
          @action="toggleTeardownPressed"
        />
      </div>

      <div v-else class="UnpopulatedBar pattern-halftone" />
    </div>

    <div v-if="preparing">
      <ProgressBar id="PreparingProgress" :speed="1" />
    </div>

    <SoundControls
      v-for="(sound, index) in stackKeys"
      v-else
      :id="sound"
      :key="`Sound-${sound}`"
      :stack-id="id"
      :order="index + 1"
    />

    <div class="collapsed-border-row">
      <IconAction
        v-if="hasStack && loaded"
        full-width
        :filled-label="!maxReached"
        :disabled="maxReached"
        :icon="maxReached ? 'clone-disabled' : 'clone'"
        :label="maxReached ? 'Stack max reached' : 'Add Sound'"
        a11y="Add another Sound to this Stack"
        @action="addSound"
      />

      <IconAction
        v-else-if="preparing"
        full-width
        filled-label
        disabled
        icon="clone"
        label="Initializing…"
        a11y="Loading audio asset for this Stack"
      />

      <IconAction
        v-else
        full-width
        filled-label
        icon="clone"
        label="Initialize Stack"
        a11y="Begin adding Sounds to this Stack"
        @action="initStack"
      />
    </div>
  </article>
</template>

<style scoped>
.StackControls {
}

.PopulatedBar {
  flex: 1 1 auto;
}

.UnpopulatedBar {
  flex: 1 1 auto;
  height: var(--row-height);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
}

.VolumeStackWrapper {
  position: relative;
  flex: 1 1 auto;
}

.TeardownStackWrapper {
  display: grid;
  z-index: 1;
  position: absolute;
  inset: var(--app-border-width);
  margin-right: calc(var(--app-border-width) * -1);
  /* Reset margin inherited from `.collapsed-border-row` */
  margin-left: 0;
}
</style>
