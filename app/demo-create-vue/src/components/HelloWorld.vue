<script setup lang="ts">
import type {PrimitiveType} from '@earwurm/types';
import {msToSec} from '@earwurm/utilities';
import {Earwurm, tokens} from 'earwurm';

interface HelloWorldProps {
  msg?: PrimitiveType;
}

defineProps<HelloWorldProps>();

// eslint-disable-next-line no-console
console.log('666ms converted to seconds:', msToSec(666));

// eslint-disable-next-line no-console
console.log('tokens.maxSpeed', tokens.maxSpeed);

const manager = new Earwurm();

// eslint-disable-next-line no-console
console.log('manager', manager);
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
