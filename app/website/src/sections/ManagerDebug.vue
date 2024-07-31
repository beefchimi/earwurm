<script setup lang="ts">
import {type ComponentPublicInstance, computed} from 'vue';

import {useDebugManager, useEarwurmStore} from '@/store';
import {IconAction, StackLabel} from '@/components';

const {manager} = useEarwurmStore();
const {
  activeStacks,
  currentState,
  stateHistory,
  errorHistory,
  unlockHistory,
  playHistory,
} = useDebugManager();

const running = computed(() => currentState.value === 'running');

function togglePlayback() {
  if (running.value) {
    manager.suspend();
  }
  else {
    manager.resume();
  }
}

function scrollEnd(element: Element | ComponentPublicInstance | null) {
  if (element instanceof Element) {
    element.scroll({left: 12345, behavior: 'smooth'});
  }
}
</script>

<template>
  <section class="ManagerDebug collapsed-border-grid">
    <div class="collapsed-border-row">
      <StackLabel label="Stacks" populated />

      <ul
        :ref="(el) => scrollEnd(el)"
        class="DebugList collapsed-border-row pattern-halftone"
      >
        <li v-for="stack in activeStacks" :key="stack" class="DebugItem">
          <StackLabel :label="stack" />
        </li>
      </ul>
    </div>

    <div class="collapsed-border-row">
      <StackLabel label="State" populated />

      <ul
        :ref="(el) => scrollEnd(el)"
        class="DebugList collapsed-border-row pattern-halftone"
      >
        <li
          v-for="(state, index) in stateHistory"
          :key="`${state}-${index}`"
          class="DebugItem"
        >
          <StackLabel :label="state" />
        </li>
      </ul>
    </div>

    <div class="collapsed-border-row">
      <StackLabel label="Errors" populated />

      <ul
        :ref="(el) => scrollEnd(el)"
        class="DebugList collapsed-border-row pattern-halftone"
      >
        <li
          v-for="(error, index) in errorHistory"
          :key="[...error, index].join(' | ')"
          class="DebugItem"
        >
          <StackLabel :label="error.join(' | ')" />
        </li>
      </ul>
    </div>

    <div class="collapsed-border-row">
      <StackLabel label="Unlocked" populated />

      <ul
        :ref="(el) => scrollEnd(el)"
        class="DebugList collapsed-border-row pattern-halftone"
      >
        <li
          v-for="(status, index) in unlockHistory"
          :key="`Unlocked-${status}-${index}`"
          class="DebugItem"
        >
          <StackLabel :label="status.toString()" />
        </li>
      </ul>
    </div>

    <div class="collapsed-border-row">
      <StackLabel label="Playing" populated />

      <ul
        :ref="(el) => scrollEnd(el)"
        class="DebugList collapsed-border-row pattern-halftone"
      >
        <li
          v-for="(status, index) in playHistory"
          :key="`Playing-${status}-${index}`"
          class="DebugItem"
        >
          <StackLabel :label="status.toString()" />
        </li>
      </ul>
    </div>

    <div class="collapsed-border-row">
      <IconAction
        icon="unmuted"
        icon-pressed="muted"
        :label="running ? 'Suspend' : 'Resume'"
        :a11y="`${running ? 'Suspend' : 'Resume'} the Earwurm`"
        :pressed="running"
        pressed-style
        @action="togglePlayback"
      />
    </div>
  </section>
</template>

<style scoped>
.ManagerDebug {
  @apply flex-fix-width;
  position: relative;

  /*
   * Overlaid border required so that our DebugList
   * can scroll behind the border lines.
  */
  &::before {
    @apply interaction-disable;
    @apply position-cover;
    z-index: 2;
    content: '';
    display: block;
    box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
  }

  > .collapsed-border-row {
    position: relative;
    z-index: 1;
  }

  > .collapsed-border-row:last-child {
    z-index: 3;
  }
}

.DebugList {
  counter-reset: debug-counter;
  flex: 1 1 auto;
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
  overflow-x: scroll;
}

.DebugItem {
  counter-increment: debug-counter;
  position: relative;

  &:first-child {
    margin-left: auto;
  }

  &::before {
    content: counter(debug-counter);
    position: absolute;
    top: 50%;
    margin-top: calc(1.6em / 2 * -1);
    left: calc(var(--app-border-width) * 2);
    display: grid;
    place-items: center;
    place-content: center;
    width: 1.6em;
    height: 1.6em;
    font-size: 1rem;
    color: var(--color-primary);
    box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
  }

  &::after {
    @apply interaction-disable;
    content: '';
    display: block;
    position: absolute;
    inset: 0;
    opacity: 0;
    background-color: var(--color-primary);
    transition: opacity var(--duration-slow) var(--easing-cubic);
  }

  & > div {
    padding-left: 2rem;
  }
}

@starting-style {
  .DebugItem::after {
    opacity: 1;
  }
}
</style>
