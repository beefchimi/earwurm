<script setup lang="ts">
export interface LabelActionProps {
  label: string;
  a11y?: string;
  disabled?: boolean;
  pressed?: boolean;
}

export type LabelActionEmits = {
  action: [event: MouseEvent];
};

defineProps<LabelActionProps>();
defineEmits<LabelActionEmits>();
</script>

<template>
  <button
    type="button"
    class="LabelAction"
    :aria-label="a11y"
    :aria-pressed="pressed ? true : undefined"
    :disabled="disabled"
    @click="(event) => $emit('action', event)"
  >
    <span class="Label">{{ label }}</span>
  </button>
</template>

<style scoped>
.LabelAction {
  color: var(--color-secondary);
  background-color: var(--color-primary);
  text-align: center;
  transition: background-color var(--duration-normal) var(--easing-cubic);

  &:disabled {
  }

  &[aria-pressed] {
  }

  &:focus-visible,
  &:hover {
    background-color: var(--color-interact);
  }

  &:active {
    background-color: var(--color-interact-dark);
  }
}

.Label {
  display: block;
  font-size: 1.6rem;
  white-space: nowrap;
}
</style>
