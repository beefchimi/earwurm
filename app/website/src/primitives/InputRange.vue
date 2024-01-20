<script setup lang="ts">
export interface InputRangeProps {
  id: string;
  name?: string;
  a11y?: string;
  min?: number;
  max?: number;
  step?: number | 'any';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
}

const {min = 0, max = 1} = defineProps<InputRangeProps>();
const modelValue = defineModel<number>();
</script>

<template>
  <input
    :id="id"
    v-model.number="modelValue"
    type="range"
    class="reset-input-range"
    :name="name"
    :aria-label="a11y"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
  />
</template>

<style scoped>
input[type='range'] {
  &:disabled {
    @apply interaction-disable;
  }
}
</style>
