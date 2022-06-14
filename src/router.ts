import { createRouter, createWebHistory } from 'vue-router';

// types
import type { Router, NavigationFailure } from 'vue-router';
interface RouterExt {
	nonDestructivePush(opts: {
		params?: Record<string, string>,
		query?: Record<string, string | string[]>
	}): Promise<void | NavigationFailure | undefined>;
}

// components
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
	// });
	// }) as ReturnType<typeof createRouter> & RouterExt;
}) as Router & RouterExt; // simpler than above

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

// custom push for NOT removing query strings / params
const nonDestructivePush: RouterExt['nonDestructivePush'] = async (opts) => {
	// console.log('router.nonDestructivePush', opts);
	return await router.push({
		...router.currentRoute.value, // keeps hash in route/URL
		params: {
			...router.currentRoute.value.params, // keeps prev params
			...opts.params || {}
		},
		query: {
			...router.currentRoute.value.query, // keeps prev query strings
			...opts.query || {}
		},
		// hash: opts.hash, // needed?
	});
};
router.nonDestructivePush = nonDestructivePush;

export default router;