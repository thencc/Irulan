// app
import { createApp } from 'vue';
import App from './App.vue';
export const app = createApp(App);

// clipboard
import VueClipboard from 'vue3-clipboard';
app.use(VueClipboard, {});

// router
import router from './router';
app.use(router);
// app.use(router, app);

// mount to dom
app.mount('#app');