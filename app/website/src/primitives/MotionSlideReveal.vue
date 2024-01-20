<script setup lang="ts">
export interface MotionSlideRevealProps {
  appear?: boolean;
  outIn?: boolean;
  reverse?: boolean;
}

defineProps<MotionSlideRevealProps>();
</script>

<template>
  <Transition
    :name="reverse ? 'slideReverse' : 'slideReveal'"
    :appear="appear"
    :mode="outIn ? 'out-in' : undefined"
  >
    <slot />
  </Transition>
</template>

<style scoped>
.slideReveal-enter-active,
.slideReveal-leave-active {
  --clip-path-x: 100%;
  clip-path: polygon(
    0 0,
    var(--clip-path-x) 0,
    var(--clip-path-x) 100%,
    0 100%
  );
  transition: clip-path var(--duration-slow) var(--easing-cubic);

  /* Nested <LabelAction />
   * Avoid using `:deep()` to cross component boundaries!
  */

  > :deep(button span) {
    opacity: 1;
    translate: 0;
    transition-property: opacity, translate;
    transition-duration: var(--duration-slow);
    transition-timing-function: var(--easing-cubic);
  }
}

.slideReveal-enter-from,
.slideReveal-leave-to {
  --clip-path-x: 0%;

  > :deep(button span) {
    opacity: 0.6;
    translate: calc(var(--app-padding) * -1);
  }
}

/*
  TODO: Find a more efficient way to toggle directions.
  `v-bind()` does not appear to work.
*/

.slideReverse-enter-active,
.slideReverse-leave-active {
  --clip-path-x: 0%;
  clip-path: polygon(
    var(--clip-path-x) 0,
    100% 0,
    100% 100%,
    var(--clip-path-x) 100%
  );
  transition: clip-path var(--duration-slow) var(--easing-cubic);

  /* Nested <LabelAction />
   * Avoid using `:deep()` to cross component boundaries!
  */

  > :deep(button span) {
    opacity: 1;
    translate: 0;
    transition-property: opacity, translate;
    transition-duration: var(--duration-slow);
    transition-timing-function: var(--easing-cubic);
  }
}

.slideReverse-enter-from,
.slideReverse-leave-to {
  --clip-path-x: 100%;

  > :deep(button span) {
    opacity: 0.6;
    translate: var(--app-padding);
  }
}
</style>
