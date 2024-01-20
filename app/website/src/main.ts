import {createApp} from 'vue';

import './styles/global.css';
import App from './App.vue';

// Required for `vite-plugin-svg-sprite` to have access to the asset.
const icons = import.meta.glob('./assets/svg/icon-*.svg');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Object.entries(icons).forEach(async ([_key, icon]) => await icon());

createApp(App).mount('#VueApp');
