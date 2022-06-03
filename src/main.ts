// app
import { createApp } from 'vue';
import App from './App.vue';
const app = createApp(App);

// clipboard
import VueClipboard from 'vue3-clipboard';
app.use(VueClipboard, {});

// router
import router from './router';
app.use(router);

// mount to dom
app.mount('#app');