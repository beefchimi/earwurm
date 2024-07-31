<script setup lang="ts">
import {
  SquareAction,
  type SquareActionEmits,
  type SquareActionProps,
  SvgIcon,
} from '@/primitives';

export interface IndexActionProps {
  index: number;
  a11y?: SquareActionProps['a11y'];
  disabled?: SquareActionProps['disabled'];
  pressed?: SquareActionProps['pressed'];
}

export type IndexActionEmits = SquareActionEmits;

defineProps<IndexActionProps>();
defineEmits<IndexActionEmits>();
</script>

<template>
  <SquareAction
    classes="IndexAction"
    :disabled="disabled"
    :a11y="a11y"
    :pressed="pressed"
    @action="(event) => $emit('action', event)"
    @hover="(event) => $emit('hover', event)"
    @hoveroff="(event) => $emit('hoveroff', event)"
  >
    <p class="IndexLabel">
      {{ index }}
    </p>

    <div class="Icon icon-wrapper icon-hover">
      <SvgIcon id="close" />
    </div>

    <div class="Icon icon-wrapper icon-pressed">
      <SvgIcon id="chevron-left" />
    </div>
  </SquareAction>
</template>

<style scoped>
.IndexAction {
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

.IndexLabel {
  font-size: 1.6rem;
  transition-property: opacity, scale;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.IndexAction:hover .IndexLabel,
.IndexAction:focus-visible .IndexLabel,
.IndexAction[aria-pressed] .IndexLabel {
  opacity: 0;
  scale: 0;
}

.Icon {
  width: var(--icon-size);
  height: var(--icon-size);
}

.icon-hover {
  opacity: 0;
  scale: 0;
  transition-property: opacity, scale;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.IndexAction:not([aria-pressed]):hover .icon-hover,
.IndexAction:not([aria-pressed]):focus-visible .icon-hover {
  opacity: 1;
  scale: 1;
}

.icon-pressed {
  color: var(--color-secondary);
  translate: var(--row-height);
  transition-property: opacity, translate;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.IndexAction[aria-pressed] .icon-pressed {
  opacity: 1;
  translate: 0;
}
</style>
