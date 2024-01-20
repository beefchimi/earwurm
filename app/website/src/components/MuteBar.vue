<script setup lang="ts">
import {computed} from 'vue';
import {arrayOfLength} from '@earwurm/utilities';
import {classNames} from '@/helpers';

export interface MuteBarProps {
  count?: number;
  collapsed?: boolean;
}

const {count = 20} = defineProps<MuteBarProps>();

// The `items` are actually individual vertical rectangles. So adding
// `+1` to the `count` helps us make the visual association with "bars".
const barItems = computed(() => arrayOfLength(Math.max(count + 1, 1)));
</script>

<template>
  <ul :class="classNames('MuteBar', {collapsed})">
    <li v-for="bar in barItems" :key="`MuteBar-Item-${bar}`" class="Item" />
  </ul>
</template>

<style scoped>
.MuteBar {
  @apply interaction-disable;
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: var(--color-primary);
  box-shadow: inset 0 0 0 var(--app-border-width) var(--color-primary);
  background-color: var(--color-secondary);
  transition-property: color, scale;
  transition-duration: var(--duration-normal);
  transition-timing-function: var(--easing-cubic);
}

.collapsed {
  scale: 1 0;
}

.Item {
  width: var(--app-border-width);
  background-color: var(--color-primary);
  transition: color var(--duration-normal) var(--easing-cubic);
}
</style>
