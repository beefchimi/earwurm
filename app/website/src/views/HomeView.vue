<script setup lang="ts">
import {SynthTypeValues} from '@/types';
import {useDebugStore} from '@/store';
import {ManagerDebug, ManagerControls, StackControls} from '@/sections';

const debugging = useDebugStore();

// TODO: Necessary so we can split our layout into two separate
// "grid column" wrappers. Required until we have support for
// `grid > masonry`, or we revise the designs.
const sliceIndex = Math.floor(SynthTypeValues.length / 2);
const column1 = SynthTypeValues.slice(0, sliceIndex);
const column2 = SynthTypeValues.slice(sliceIndex);
const entries = [column1, column2];
</script>

<template>
  <main class="HomeView">
    <ManagerDebug v-if="debugging" />
    <ManagerControls />

    <section class="Stacks">
      <div
        v-for="(column, index) in entries"
        :key="`StacksColumn-${index}`"
        class="StacksColumn"
      >
        <StackControls
          v-for="stack in column"
          :id="stack"
          :key="`Stack-${stack}`"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
.HomeView {
  display: grid;
  align-content: start;
  gap: var(--app-spacing);

  @media (min-width: 1440px) and (min-height: 1280px) {
    gap: var(--row-height);
  }
}

.Stacks {
  display: grid;
  gap: var(--app-spacing);
  grid-template-columns: repeat(
    auto-fit,
    minmax(var(--app-full-width-mobile), 1fr)
  );

  @media (min-width: 1440px) and (min-height: 1280px) {
    gap: var(--row-height);
  }
}

.StacksColumn {
  display: grid;
  gap: var(--app-spacing);
  grid-auto-rows: min-content;

  @media (min-width: 1440px) and (min-height: 1280px) {
    gap: var(--row-height);
  }
}
</style>
