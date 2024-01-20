<script setup lang="ts">
import {computed} from 'vue';

import {calcProgress} from '@earwurm/utilities';

import {InputRange, type InputRangeProps} from '@/primitives';
import {MuteBar} from '@/components';

export type VolumeStackProps = Pick<
  InputRangeProps,
  'id' | 'name' | 'disabled'
>;

const MIN = 0;
const MAX = 1;
const STEP = 0.01;

defineProps<VolumeStackProps>();
const modelValue = defineModel<number>();

const progress = computed(() => {
  const current = modelValue.value ?? MIN;
  return calcProgress(current, {max: MAX});
});
</script>

<template>
  <div class="VolumeStack" :style="{'--slider-progress': progress}">
    <div class="MuteBarWrapper">
      <MuteBar :collapsed="!disabled" />
    </div>

    <InputRange
      :id="id"
      v-model="modelValue"
      class="Slider"
      aria-label="Increase / decrease the Stack volume"
      :name="name"
      :min="MIN"
      :max="MAX"
      :step="STEP"
      :disabled="disabled"
    />

    <div class="Progress">
      <div class="FakeThumb" />

      <output :id="`${id}-Output`" class="visually-hidden">{{
        modelValue ?? MIN
      }}</output>
    </div>
  </div>
</template>

<style scoped>
.VolumeStack {
  --volume-stack-track-height: calc(
    var(--row-height) - var(--action-padding) * 2
  );

  --volume-stack-track-stop-1: calc(50% - var(--app-border-width) / 2);
  --volume-stack-track-stop-2: calc(50% + var(--app-border-width) / 2);

  --slider-progress: 0;
  --slider-percent: calc(var(--slider-progress) * 1%);
  --slider-offset: calc(
    var(--row-height) * (0.5 - var(--slider-progress) / 100)
  );

  position: relative;
  z-index: 1;
  display: grid;
  align-items: center;
  flex: 1 1 auto;
  padding: var(--action-padding);
  height: var(--row-height);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);

  &:focus-within {
    z-index: 2;
  }
}

/* --- InputRange --- */

@mixin input-track {
  height: var(--volume-stack-track-height);
  /* prettier-ignore */
  background: linear-gradient(
    transparent 0% var(--volume-stack-track-stop-1),
    var(--color-primary) var(--volume-stack-track-stop-1) var(--volume-stack-track-stop-2),
    transparent var(--volume-stack-track-stop-2) 100%
  );
}

@mixin input-thumb {
  width: var(--row-height);
  height: var(--row-height);
  background-color: transparent;
  outline: var(--app-border-width) solid transparent;
  outline-offset: calc(var(--app-border-width) * -1);
  transition: outline-color var(--duration-normal) var(--easing-cubic);
}

@mixin input-thumb-focus {
  outline-color: var(--color-interact);
}

.Slider {
  grid-area: 1 / 1;
  height: var(--volume-stack-track-height);
  color: var(--color-primary);
  transition-property: color, scale, opacity;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);

  &:disabled {
    scale: 1 0;
    opacity: 0;
  }

  &:hover,
  &:hover + .Progress {
    --color-primary: var(--color-interact);
  }

  &:active,
  &:active + .Progress {
    --color-primary: var(--color-interact-dark);
  }

  /* Webkit */

  &::-webkit-slider-runnable-track {
    @apply input-track;
  }

  &::-webkit-slider-thumb {
    @apply input-thumb;
    /* Unlike Mozilla, we need to manually center the <thumb /> */
    margin-top: calc(var(--action-padding) * -1);
  }

  &:focus::-webkit-slider-thumb {
    @apply input-thumb-focus;
  }

  /* Mozilla */

  &::-moz-range-track {
    @apply input-track;
  }

  &::-moz-range-thumb {
    @apply input-thumb;
  }

  &:focus::-moz-range-thumb {
    @apply input-thumb-focus;
  }
}

/* --- Progress --- */

.Progress {
  pointer-events: none;
  display: grid;
  grid-area: 1 / 1;
  align-content: center;
  justify-content: end;
  width: calc(var(--slider-percent) + var(--slider-offset));
  height: calc(var(--app-border-width) * 2);
  color: var(--color-primary);
  background-color: currentColor;
  transition-property: color, scale, opacity;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.Slider:disabled + .Progress {
  scale: 1 0;
  opacity: 0;
}

.FakeThumb {
  margin-right: calc(var(--row-height) / 2 * -1);
  width: var(--row-height);
  height: 1rem;
  background-color: currentColor;
}

/* --- Mute Bar --- */

.MuteBarWrapper {
  grid-area: 1 / 1;
  height: 1rem;
}
</style>
