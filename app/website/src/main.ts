import {createApp} from 'vue';

import './styles/global.css';
import App from './App.vue';

// Required for `vite-plugin-svg-sprite` to have access to the asset.
const icons = import.meta.glob('./assets/svg/icon-*.svg');

// eslint-disable-next-line ts/no-misused-promises, ts/return-await
Object.entries(icons).forEach(async ([_key, icon]) => await icon());

// eslint-disable-next-line ts/no-unsafe-argument
createApp(App).mount('#VueApp');
