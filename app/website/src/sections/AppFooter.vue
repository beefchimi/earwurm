<script setup lang="ts">
import {useThemeStore} from '@/store';

import {IconAction} from '@/components';

// TODO: Add Theme toggle once ready.
const SHOW_THEME_ACTION = false;
const {theme, toggleTheme} = useThemeStore();
</script>

<template>
  <footer class="AppFooter">
    <div class="TempToggle">
      <IconAction
        v-if="SHOW_THEME_ACTION"
        icon="diamonds"
        label="Theme"
        :pressed="theme === 'dark'"
        pressed-style
        @action="toggleTheme"
      />

      <IconAction
        icon="star"
        label="GitHub"
        url="https://github.com/beefchimi/earwurm"
        external
        pressed
        pressed-style
      />
    </div>

    <p class="LegalText">
      &copy; Curtis Dulmage | Infinity—Beyond
    </p>
  </footer>
</template>

<style scoped>
.AppFooter {
  text-align: center;
}

.LegalText {
  font-size: 0.8rem;
}

.TempToggle {
  display: grid;
  justify-content: center;
  margin-bottom: 2rem;
}
</style>
