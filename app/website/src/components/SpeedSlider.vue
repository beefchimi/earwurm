<script setup lang="ts">
import {computed} from 'vue';
import {tokens} from 'earwurm';
import {calcProgress} from '@earwurm/utilities';

import {classNames} from '@/helpers';
import {InputRange, type InputRangeProps} from '@/primitives';
import {MuteBar} from '@/components';

export type SpeedSliderProps = Pick<
  InputRangeProps,
  'id' | 'name' | 'disabled'
>;

const MIN = tokens.minSpeed;
const MAX = tokens.maxSpeed;
const STEP = MIN;

const TOTAL_STEPS = MAX / MIN;
const MIN_VALUE = 100 / TOTAL_STEPS;

defineProps<SpeedSliderProps>();
const modelValue = defineModel<number>();

const progress = computed(() => {
  const current = modelValue.value ?? MIN;
  return calcProgress(current, {min: MIN, max: MAX});
});

const stripes = computed(() => {
  const minStripes = Math.floor(TOTAL_STEPS);
  const additionalStripes = Math.ceil(progress.value / MIN_VALUE);

  return minStripes + additionalStripes;
});
</script>

<template>
  <div
    :class="classNames('SpeedSlider', {disabled})"
    :style="{'--slider-progress': progress}"
  >
    <div class="BackgroundStripes">
      <MuteBar :count="stripes" />
    </div>

    <div class="ControlsWrapper">
      <InputRange
        :id="id"
        v-model="modelValue"
        class="Slider"
        aria-label="Increase / decrease the playback rate"
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
  </div>
</template>

<style scoped>
.SpeedSlider {
  /* Webkit does not like `height > 100%` for inputs. */
  --speed-slider-track-height: calc(
    var(--row-height) - var(--action-padding) * 2
  );
  --speed-slider-progress-height: calc(
    var(--row-height) - var(--action-padding) * 2 - var(--app-border-width) * 4
  );

  --speed-slider-track-stop-1: calc(50% - var(--app-border-width));
  --speed-slider-track-stop-2: calc(50% + var(--app-border-width));

  --slider-progress: 0;
  --slider-percent: calc(var(--slider-progress) * 1%);
  --slider-offset: calc(
    var(--row-height) * (0.5 - var(--slider-progress) / 100)
  );

  display: grid;
  flex: 1 1 auto;
  height: var(--row-height);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);

  &.disabled {
    @apply interaction-disable;

    > .Progress {
      scale: 1 0;
    }
  }
}

.BackgroundStripes {
  grid-area: 1 / 1;
}

.ControlsWrapper {
  position: relative;
  display: grid;
  align-items: center;
  grid-area: 1 / 1;
  margin: var(--action-padding);
  padding: 0 calc(var(--app-border-width) * 2);
  color: var(--color-primary);
  background-color: var(--color-secondary);
  box-shadow: inset 0 0 0 var(--app-border-width) currentColor;
  transition: color var(--duration-normal) var(--easing-cubic);

  &:focus-within {
    color: var(--color-interact);
  }

  &:hover {
    color: var(--color-interact);
  }

  &:active {
    color: var(--color-interact-dark);
  }
}

/* --- InputRange --- */

@mixin input-track {
  height: var(--speed-slider-track-height);
  /* prettier-ignore */
  background: linear-gradient(
    transparent 0% var(--speed-slider-track-stop-1),
    currentColor var(--speed-slider-track-stop-1) var(--speed-slider-track-stop-2),
    transparent var(--speed-slider-track-stop-2) 100%
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
  height: var(--speed-slider-track-height);

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
  @apply interaction-disable;
  display: grid;
  justify-items: end;
  grid-area: 1 / 1;
  width: calc(var(--slider-percent) + var(--slider-offset));
  height: var(--speed-slider-progress-height);
  background-color: currentColor;
  transition: scale var(--duration-normal) var(--easing-cubic);
}

.FakeThumb {
  margin-right: calc(var(--row-height) / 2 * -1);
  width: var(--row-height);
  height: 100%;
  background-color: var(--color-secondary);
  border: var(--app-border-width) solid currentColor;
}
</style>
