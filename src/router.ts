import { createRouter, createWebHistory } from 'vue-router';

import Main from './components/pages/Main.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			name: 'home',
			path: '/:ledger',
			component: Main,
			children: [
				{
					name: 'search',
					path: 's/:query',
					component: Main
				},
				{
					name: 'contract',
					path: 'contract/:contractId',
					component: Main
				},
				{
					name: 'full',
					path: 'contract/:contractId/s/:query',
					component: Main
				}
			]
		}
	]
});

router.beforeEach(async (to, from, next) => {
	// check auth for example if naving to /account...
	next(); // approve
});

export default router;