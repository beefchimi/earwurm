<script setup lang="ts">
import {LogoEarwurmCombo} from '@/components';
</script>

<template>
  <header class="AppHeader">
    <h1 class="visually-hidden">Earwurm</h1>

    <div class="LogoWrapper">
      <LogoEarwurmCombo />
    </div>

    <h2 class="Heading2">
      <span>Browser audio for</span> <span>the modern age</span>
    </h2>
  </header>
</template>

<style scoped>
.AppHeader {
  display: grid;
  gap: 3.2rem;
  justify-content: center;
  text-align: center;

  @media (min-width: 636px) {
    gap: var(--app-padding);
    grid-auto-flow: column;
    align-items: center;
    justify-content: start;
    text-align: left;
  }
}

.LogoWrapper {
  /* Omitting `.icon-wrapper` so the SVG scales with the container */
  width: var(--app-full-width-mobile);
  color: var(--color-primary);
}

.Heading2 {
  font-size: 1.4rem;
  line-height: 1.2;
  color: var(--color-primary);

  > span {
    display: block;

    @media (min-width: 1440px) {
      display: inline;
    }
  }
}
</style>
