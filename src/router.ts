import { createRouter, createWebHistory } from 'vue-router';

import Main from './components/pages/Main.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [{
		name: 'home', path: '/:ledger', component: Main,
	}, {
		name: 'search', path: '/:ledger/s/:query', component: Main
	}, {
		name: 'contract', path: '/:ledger/contract/:contractId', component: Main
	}, {
		name: 'full', path: '/:ledger/contract/:contractId/s/:query', component: Main
	}]
});

export default router;