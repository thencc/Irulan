import { createApp } from 'vue'
import App from './App.vue'
import VueClipboard from 'vue3-clipboard';

const app = createApp(App)

app.use(VueClipboard, {});

app.mount('#app')
