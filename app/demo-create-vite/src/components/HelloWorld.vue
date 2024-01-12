<script setup lang="ts">
import {ref} from 'vue';
import type {PrimitiveType} from '@earwurm/types';
import {msToSec} from '@earwurm/utilities';
import {Earwurm, tokens} from 'earwurm';

interface HelloWorldProps {
  msg?: PrimitiveType;
}

defineProps<HelloWorldProps>();

const count = ref(0);
const manager = new Earwurm();

/* eslint-disable no-console */
console.log('VITE > msToSec', msToSec(123));
console.log('VITE > tokens.minSpeed', tokens.minSpeed);
console.log('VITE > Earwurm', manager);
/* eslint-enable no-console */
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
