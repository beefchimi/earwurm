<script setup lang="ts">
import {useDebugManager} from '@/store';
import {StackLabel} from '@/components';

const {activeStacks, stateHistory, errorHistory, unlockHistory, playHistory} =
  useDebugManager();
</script>

<template>
  <section class="ManagerDebug collapsed-border-grid">
    <div class="collapsed-border-row">
      <StackLabel label="Stacks" populated />

      <ul class="DebugList collapsed-border-row--reverse pattern-halftone">
        <li v-for="stack in activeStacks" :key="stack" class="DebugItem">
          <StackLabel :label="stack" />
        </li>
      </ul>
    </div>

    <div class="collapsed-border-row">
      <StackLabel label="State" populated />

      <ul class="DebugList collapsed-border-row--reverse pattern-halftone">
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

      <ul class="DebugList collapsed-border-row--reverse pattern-halftone">
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
        class="DebugList collapsed-border-row--reverse pattern-halftone--reverse pattern-halftone"
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

      <ul class="DebugList collapsed-border-row--reverse pattern-halftone">
        <li
          v-for="(status, index) in playHistory"
          :key="`Playing-${status}-${index}`"
          class="DebugItem"
        >
          <StackLabel :label="status.toString()" />
        </li>
      </ul>
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
}

.DebugList {
  counter-reset: debug-counter;
  flex-direction: row-reverse;
  flex: 1 1 auto;
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
  overflow-x: scroll;
}

.DebugItem {
  counter-increment: debug-counter;
  position: relative;

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

  & > div {
    padding-left: 2rem;
  }
}
</style>
