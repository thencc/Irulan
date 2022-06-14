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
	console.log('r befo', from, to);
	next();

	// this.$router.replace({
	// 	...this.$route, // makes sure hash stays in URL
	// 	name: this.$route.name || 'home',
	// 	params: {
	// 		...this.$route.params, // makes sure OTHER params stay in URL
	// 		ledger: this.config.ledger,
	// 		query: this.$route.params.query || undefined,
	// 		conract: this.$route.params.contract || undefined
	// 	},
	// 	query: {
	// 		...this.$route.query, // makes sure OTHER query params still in URL
	// 	}
	// });


	// attempt
	/*
	if (to.redirectedFrom !== undefined) {
		next();
	}
	// if (from.fullPath == to.fullPath) {
	// 	console.log('do normal nav');
	// 	next();
	// }
	else {
		console.log('special nav');
		let newTo = {
			// ...from, // keep hash
			// ...to,
			// hash: to.hash || from.hash,
			name: to.name || 'home',
			params: {
				...from.params,
				...to.params
			},
			query: {
				...from.query,
				...to.query
			},
			// meta: {
			// 	force: true
			// }
		};
		console.log('newTo', newTo);

		next(newTo);
		// next({ path: '/test' });
	}
	*/
});

export default router;