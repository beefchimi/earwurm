<script setup lang="ts">
import {computed, ref} from 'vue';
import {arrayOfLength, clamp, clx, roundNumber} from 'beeftools';

import {MuteBar} from '@/components';

export interface VolumeSoundProps {
  id: string;
  value?: number;
  disabled?: boolean;
}

export type VolumeSoundEmits = {
  change: [volume: number];
};

const MIN = 0;
const MAX = 1;

const TICK_LENGTH = 14;
const STEP = 1 / TICK_LENGTH;

const PRECISION = 4;

const TICKS = arrayOfLength(TICK_LENGTH).map((index) => {
  const tickVolume = (index + 1) * STEP;
  return roundNumber(tickVolume, PRECISION);
});

const {value = MIN} = defineProps<VolumeSoundProps>();
const emits = defineEmits<VolumeSoundEmits>();

const volume = computed(() => {
  const currentVolume = clamp(MIN, value, MAX);
  return roundNumber(currentVolume, PRECISION);
});

const interactIndex = ref<number>();

function handleInteract(index: number) {
  interactIndex.value = index;
}

function handleInteractEnd() {
  interactIndex.value = undefined;
}

function handleChange(volume: number) {
  emits('change', volume);
}
</script>

<template>
  <div :class="clx('VolumeSound', {disabled})">
    <div :class="clx('MuteBarWrapper', {show: disabled})">
      <MuteBar :count="TICK_LENGTH" />
    </div>

    <ul class="List list-base">
      <li
        v-for="(tick, index) in TICKS"
        :key="`List-Tick-${tick}`"
        class="Tick"
      >
        <button
          type="button"
          :class="
            clx(
              'Action',
              interactIndex !== undefined
                ? {
                    beforeHover: index < interactIndex,
                    afterHover: index > interactIndex,
                  }
                : {},
            )
          "
          :aria-label="`Set volume to: ${tick}`"
          :aria-pressed="tick > volume ? undefined : true"
          :disabled="disabled"
          @click="handleChange(tick)"
          @blur="handleInteractEnd"
          @focus="handleInteract(index)"
          @mouseenter="handleInteract(index)"
          @mouseleave="handleInteractEnd"
        >
          <div class="Interior">
            <p class="Label visually-hidden">Volume: {{ tick }}</p>
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.VolumeSound {
  --volume-sound-gap: calc(var(--action-padding) - var(--app-border-width));
  --volume-sound-interior-bg: transparent;
  --volume-sound-halftone-opacity: 0;
  --volume-sound-border-opacity: 1;

  display: grid;
  flex: 1 1 auto;
  height: var(--row-height);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
}

.List {
  display: grid;
  grid-auto-flow: column;
  grid-area: 1 / 1;
  transition-property: scale, opacity;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.disabled .List {
  scale: 1 0;
  opacity: 0;
}

.Tick {
  display: grid;

  &:not(:first-child) .Action {
    padding-left: var(--volume-sound-gap);
  }

  &:not(:last-child) .Action {
    padding-right: 0;
  }
}

.Action {
  display: grid;
  padding: var(--action-padding);
  color: var(--color-primary);

  &[aria-pressed] {
    --volume-sound-interior-bg: currentColor;
  }

  &:disabled {
    @apply interaction-disable;
  }

  &:focus-visible,
  &:hover {
    --volume-sound-interior-bg: currentColor;
    color: var(--color-interact);
  }

  &:active {
    color: var(--color-interact-dark);
  }
}

.beforeHover {
  --volume-sound-interior-bg: currentColor;
  color: var(--color-primary);
}

.afterHover {
  &[aria-pressed] {
    --volume-sound-interior-bg: transparent;
    --volume-sound-halftone-opacity: 1;
    /* --volume-sound-border-opacity: 0; */
  }
}

.Interior {
  display: grid;
  background-color: var(--volume-sound-interior-bg);
  transition-property: color, background-color;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);

  &::before,
  &::after {
    content: '';
    display: block;
    grid-area: 1 / 1;
    transition: opacity var(--duration-normal) var(--easing-cubic);
  }

  &::before {
    @apply pattern-halftone-dense;
    opacity: var(--volume-sound-halftone-opacity);
  }

  &::after {
    opacity: var(--volume-sound-border-opacity);
    box-shadow: inset 0 0 0 var(--app-border-width) currentColor;
  }
}

.Label {
}

/* --- Mute Bar --- */

.MuteBarWrapper {
  @apply visible-hide;
  padding: 0 var(--action-padding);
  grid-area: 1 / 1;
  align-self: center;
  height: calc(100% - var(--action-padding) * 2);
  transition-property: height, opacity, visibility;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);

  &.show {
    @apply visible-show;
    height: 1rem;
  }
}
</style>
