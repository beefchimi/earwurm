<script setup lang="ts">
export interface MotionFadeScaleProps {
  appear?: boolean;
  outIn?: boolean;
}

// TODO: Consider emitting for `@enter` and `@leave`.
defineProps<MotionFadeScaleProps>();
</script>

<template>
  <Transition
    name="fadeScale"
    :appear="appear"
    :mode="outIn ? 'out-in' : undefined"
  >
    <slot />
  </Transition>
</template>

<style scoped>
.fadeScale-enter-active,
.fadeScale-leave-active {
  transition-property: opacity, scale;
  transition-duration: var(--duration-normal);
  transition-timing-function: ease-in-out;
}

.fadeScale-enter-from,
.fadeScale-leave-to {
  opacity: 0;
  scale: 0.6;
}
</style>
