import { createApp } from 'vue'
import App from './App.vue'
import VueClipboard from 'vue3-clipboard';
import { createRouter, createWebHistory } from 'vue-router';

const app = createApp(App);

app.use(VueClipboard, {});

const router = createRouter({
    history: createWebHistory(),
    routes: [{
        name: 'home', path: '/:ledger', component: App,
    }, {
        name: 'search', path: '/:ledger/s/:query', component: App
    }, {
        name: 'contract', path: '/:ledger/contract/:contractId', component: App
    }, {
        name: 'full', path: '/:ledger/contract/:contractId/s/:query', component: App
    }]
});

app.use(router);


app.mount('#app')
