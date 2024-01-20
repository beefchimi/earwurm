<script setup lang="ts">
import {classNames} from '@/helpers';

export interface StackLabelProps {
  label: string;
  populated?: boolean;
}

defineProps<StackLabelProps>();
</script>

<template>
  <div :class="classNames('StackLabel', {populated})">
    <p class="Text">{{ label }}</p>
  </div>
</template>

<style scoped>
.StackLabel {
  display: grid;
  place-items: center;
  place-content: center;
  padding: 0.8rem;
  min-width: var(--row-height);
  height: var(--row-height);
  color: var(--color-primary);
  background-color: var(--color-secondary);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
  transition-property: color, background-color;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.populated {
  color: var(--color-secondary);
  background-color: var(--color-primary);
}

.Text {
  @apply truncate;
  @apply flex-fix-width;
  font-size: 1.4rem;
}
</style>
