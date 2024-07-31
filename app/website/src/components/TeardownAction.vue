<script setup lang="ts">
import {
  SquareAction,
  type SquareActionEmits,
  type SquareActionProps,
  SvgIcon,
} from '@/primitives';

export interface TeardownActionProps {
  a11y?: SquareActionProps['a11y'];
  disabled?: SquareActionProps['disabled'];
  pressed?: SquareActionProps['pressed'];
}

export type TeardownActionEmits = SquareActionEmits;

defineProps<TeardownActionProps>();
defineEmits<TeardownActionEmits>();
</script>

<template>
  <SquareAction
    classes="TeardownAction"
    :disabled="disabled"
    :a11y="a11y"
    :pressed="pressed"
    @action="(event) => $emit('action', event)"
    @hover="(event) => $emit('hover', event)"
    @hoveroff="(event) => $emit('hoveroff', event)"
  >
    <div class="Icon icon-wrapper icon-close">
      <SvgIcon id="close" />
    </div>

    <div class="Icon icon-wrapper icon-arrow">
      <SvgIcon id="chevron-right" />
    </div>
  </SquareAction>
</template>

<style scoped>
.TeardownAction {
  display: grid;
  overflow: hidden;

  > * {
    grid-area: 1/1;
  }

  &[aria-pressed] {
    background-color: var(--color-primary);

    &:hover,
    &:focus-visible {
      background-color: var(--color-interact);
    }
  }
}

.Icon {
  width: var(--icon-size);
  height: var(--icon-size);
}

.icon-close {
  transition-property: opacity, scale;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.TeardownAction[aria-pressed] .icon-close {
  opacity: 0;
  scale: 0;
}

.icon-arrow {
  color: var(--color-secondary);
  opacity: 0;
  translate: calc(var(--row-height) * -1);
  transition-property: opacity, translate;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.TeardownAction[aria-pressed] .icon-arrow {
  opacity: 1;
  translate: 0;
}
</style>
