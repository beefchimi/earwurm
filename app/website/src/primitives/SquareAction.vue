<script setup lang="ts">
import {classNames} from '@/helpers';

export interface SquareActionProps {
  classes?: string;
  a11y?: string;
  url?: string;
  external?: boolean;
  disabled?: boolean;
  pressed?: boolean;
}

export type SquareActionEmits = {
  action: [event: MouseEvent];
  hover: [event: MouseEvent];
  hoveroff: [event: MouseEvent];
};

defineProps<SquareActionProps>();
defineEmits<SquareActionEmits>();
</script>

<template>
  <a
    v-if="url?.length"
    :href="url"
    :class="classNames('SquareAction', 'link', {disabled}, classes)"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>

  <button
    v-else
    type="button"
    :class="classNames('SquareAction', 'button', classes)"
    :aria-label="a11y"
    :aria-pressed="pressed ? true : undefined"
    :disabled="disabled"
    @click="(event) => $emit('action', event)"
    @mouseenter="(event) => $emit('hover', event)"
    @mouseleave="(event) => $emit('hoveroff', event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.SquareAction {
  position: relative;
  z-index: 1;
  display: grid;
  place-content: center;
  place-items: center;
  text-align: center;
  width: var(--row-height);
  height: var(--row-height);
  color: var(--color-primary);
  background-color: transparent;
  box-shadow: inset 0 0 0 var(--app-border-width) currentColor;
  transition-property: color, background-color, box-shadow, z-index;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);

  &:focus-visible,
  &:hover {
    color: var(--color-interact);
    z-index: 2;
  }

  &:active {
    color: var(--color-interact-dark);
  }
}

.link {
  &.disabled {
    @apply interaction-disable;
  }
}

.button {
  &:disabled {
    @apply interaction-disable;
  }
}
</style>
