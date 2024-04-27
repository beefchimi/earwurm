<script setup lang="ts">
import {clx} from 'beeftools';

export interface StackLabelProps {
  label: string;
  populated?: boolean;
  truncate?: boolean;
}

defineProps<StackLabelProps>();
</script>

<template>
  <div :class="clx('StackLabel', {populated})">
    <p :class="clx('Text', {truncate})">{{ label }}</p>
  </div>
</template>

<style scoped>
.StackLabel {
  display: grid;
  place-items: center;
  place-content: center;
  padding: 0.8rem;
  flex: 0 0 auto;
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
  font-size: 1.4rem;
}

.truncate {
  @apply truncate;
  @apply flex-fix-width;
}
</style>
