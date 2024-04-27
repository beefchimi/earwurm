<script setup lang="ts">
import {clx} from 'beeftools';

export interface DragHandleProps {
  invert?: boolean;
}

defineProps<DragHandleProps>();
</script>

<template>
  <div :class="clx('DragHandle', {invert})">
    <div class="Column">
      <div class="Dot" />
    </div>

    <div class="Column">
      <div class="Dot" />
    </div>
  </div>
</template>

<style scoped>
.DragHandle {
  --drag-handle-dot-size: 0.2rem;

  display: grid;
  grid-auto-flow: column;
  gap: var(--drag-handle-dot-size);
  color: var(--color-primary);
  transition: color var(--duration-normal) var(--easing-cubic);

  &.invert {
    color: var(--color-secondary);
  }
}

.Column {
  display: grid;
  gap: var(--drag-handle-dot-size);

  &::before,
  &::after {
    content: '';
    width: var(--drag-handle-dot-size);
    height: var(--drag-handle-dot-size);
    background-color: currentColor;
  }
}

.Dot {
  width: var(--drag-handle-dot-size);
  height: var(--drag-handle-dot-size);
  background-color: currentColor;
}
</style>
