import { createRouter, createWebHistory } from 'vue-router';

// TODO update this awkward type extension to new well supported appraoch
// https://vuejs.org/api/utility-types.html#componentcustomoptions
/**
 * import { Route } from 'vue-router'

	declare module 'vue' {
	interface ComponentCustomOptions {
		beforeRouteEnter?(to: any, from: any, next: () => void): void
	}
	}
 */

// types
import type { Router } from 'vue-router';
interface RouterExt {
	nonDestructivePush(opts: {
		name?: string;
		params?: Record<string, string>, // TODO test if | undefined works here too
		query?: Record<string, string | string[] | undefined> // setting a qs to undefined removes just this one
	}): ReturnType<Router['push']>;

	nonDestructiveResolve(opts: {
		name?: string;
		params?: Record<string, string>, // TODO test if | undefined works here too
		query?: Record<string, string | string[] | undefined> // setting a qs to undefined removes just this one
	}): ReturnType<Router['resolve']>;
}

// pages
import Dashboard from './components/pages/Dashboard.vue';
import About from './components/pages/About.vue';
import Terms from './components/pages/Terms.vue';
// panels (for main dashboard view)
import Header from './components/panels/Header.vue';
import AppPanel from './components/panels/AppPanel.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			redirect: '/testnet'
		},
		{
			path: '/about',
			components: {
				default: About,
				// header: AppPanel
			}
		},
		{
			path: '/terms',
			// component: Terms
			components: {
				default: Terms,
				// header: AppPanel // TODO remove this. // DONT include header component
			}
		},
		{
			name: 'Dashboard',
			path: '/:ledger',
			// component: Dashboard,
			components: {
				header: Header,
				default: Dashboard
			},
			beforeEnter: (to, from, next) => {
				// FYI only triggers on first load, not params.ledger update
				let leg = to.params.ledger;
				if (typeof leg !== 'string') {
					console.warn('bad ledger param 1, go home.');
					next('/');
					return;
				} else if (leg !== 'testnet' && leg !== 'mainnet') {
					console.warn('bad ledger param 2, go home.');
					next('/');
					return;
				} else {
					next(); // pass
					return;
				}
			},
			children: [
				{
					// because smart-contracts are apps, assets or addresses
					name: 'DashApp',
					path: 'app/:appId',
					// component: AppPanel
					components: {
						default: AppPanel,
						// header: AppPanel
					}
				},

				// {
				// 	name: 'search',
				// 	path: 's/:query',
				// 	component: Main
				// },
				// {
				// 	// TODO rename to app/:appId
				// 	// because smart-contracts are apps, assets or addresses
				// 	name: 'contract',
				// 	path: 'contract/:contractId',
				// 	component: Main // TODO change to sidebar: Browser, main: AppContract.vue
				// },
				// {
				// 	name: 'full',
				// 	path: 'contract/:contractId/s/:query',
				// 	component: Main
				// }
			]
		}
	]
	// });
	// }) as ReturnType<typeof createRouter> & RouterExt;
}) as Router & RouterExt; // simpler than above

router.beforeEach(async (to, from, next) => {
	// console.log('r befo', from, to);

	if (to.params.contract == 'undefined') {
		console.warn('SHOULDNT HAPPEN CHECK IT OUT DEVS');
		delete to.params.contract;
	}

	next(); // assumes next(to) so previous delete obj kv pairs are heard

	// this.$router.replace({
	// 	...this.$route, // makes sure hash stays in URL
	// 	name: this.$route.name || 'home',
	// 	params: {
	// 		...this.$route.params, // makes sure OTHER params stay in URL
	// 		ledger: this.config.ledger,
	// 		query: this.$route.params.query || undefined,
	// 		contract: this.$route.params.contract || undefined
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
	return await router.push(nonDestructiveResolve(opts));
	//
	// return await router.push({
	// 	...router.currentRoute.value, // keeps hash in route/URL
	// 	name: opts.name || router.currentRoute.value.name || undefined,
	// 	params: {
	// 		...router.currentRoute.value.params, // keeps prev params
	// 		...opts.params || {}
	// 	},
	// 	query: {
	// 		...router.currentRoute.value.query, // keeps prev query strings
	// 		...opts.query || {}
	// 	},
	// 	// hash: opts.hash, // needed?
	// });
};
router.nonDestructivePush = nonDestructivePush;

const nonDestructiveResolve: RouterExt['nonDestructiveResolve'] = (opts) => {
	// console.log('router.nonDestructiveResolve', opts);
	return router.resolve({
		...router.currentRoute.value, // keeps hash in route/URL
		name: opts.name || router.currentRoute.value.name || undefined,
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
router.nonDestructiveResolve = nonDestructiveResolve;

export default router;