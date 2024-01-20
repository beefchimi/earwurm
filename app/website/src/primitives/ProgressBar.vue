<script setup lang="ts">
import {computed} from 'vue';
import {clamp, calcProgress} from '@earwurm/utilities';
import {classNames} from '@/helpers';

export interface ProgressBarProps {
  id: string;
  value?: number;
  min?: number;
  max?: number;
  speed?: number;
  disabled?: boolean;
}

const {value = 0, min = 0, max = 100} = defineProps<ProgressBarProps>();
const progress = computed(() => calcProgress(value, {min, max, round: true}));
</script>

<template>
  <div
    :class="
      classNames('ProgressBar', 'pattern-diagonal', {
        'pattern-diagonal--animated': speed,
        disabled,
      })
    "
    :style="{
      '--progress-bar-width': clamp(0, progress, 100),
      '--progress-pattern-speed': speed
        ? clamp(400, 800 / speed, 2000)
        : undefined,
    }"
  >
    <progress :id="id" class="Progress" :value="value" :min="min" :max="max">
      <output :id="`${id}-Output`" class="visually-hidden"
        >{{ progress }}%</output
      >
    </progress>
  </div>
</template>

<style scoped>
.ProgressBar {
  --progress-bar-width: 0;

  display: grid;
  flex: 1 1 auto;
  height: var(--row-height);
  background-color: var(--color-secondary);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);

  /* Fill (progress) */
  &::before {
    content: '';
    grid-area: 1 / 1;
    width: calc(var(--progress-bar-width) * 1%);
    height: 100%;
    background-color: var(--color-primary);
  }

  &.disabled {
  }
}

.pattern-diagonal--animated {
  /* Custom class for unique duration and easing. */
  animation: anim-svg-diagonal calc(var(--progress-pattern-speed, 0) * 1ms)
    infinite steps(4);
}

.Progress {
  grid-area: 1 / 1;
  /* We use the ::before selector to show progress. */
  opacity: 0;
}
</style>
