import { reactive, watch } from 'vue';
import router from '../../router';

import state from '../index';
import { bus } from '../../bus';
import { debounce } from '../../utils';
import { sAlgo } from './sAlgo';

export const sSearch = reactive({
	query: '',
	// queryFound: '' as string | number, // appId / address / etc (or use response below?)
	response: null as null | any, // TODO type... something like: { type: 'account' | 'asset' | 'app', object: AppState, Account, Asset }
	loading: false,

	getSearchRoute(query: string) {
		return router.nonDestructiveResolve({
			query: {
				s: query
			}
		});
	},
	getSearchPath(query: string) {
		return router.nonDestructiveResolve({
			query: {
				s: query
			}
		}).fullPath;
	},

});

const parseQuery = async (q: string) => {
	if (!q) return;
	console.log('parseQuery', q);

	if (sSearch.loading) {
		console.log('sSearch loading is parseQuery...');
	}

	if (!sAlgo.connected) {
		console.warn('sAlgo not connected but trying parseQuery search');
		return;
	}

	if (!sSearch.query && q) {
		// can also account for this using a custom debounce timer like in tables/Account.ts/watch/usernameNew
		console.warn('dont do a delayed search because there nothing to search for (user likely deleted last char in search input)');
		return;
	}

	sSearch.loading = true;
	sSearch.response = null; // reset
	var response = {} as any;

	// make this an emit?
	state.log(`Searching: ${q}`);

	// console.log('pre-lookup', state.sAlgo.algonaut.sdk);
	// console.log('pre-lookup:', state.sAlgo.algonaut.config?.BASE_SERVER);

	// look account?
	// if (state.sAlgo.algonaut.sdk?.isValidAddress(q)) { // old
	if (state.sAlgo.algonaut.sdk?.isValidAddress(q)) { // new
		console.log('doing account lookup');

		state.success('Account found.');
		response = await state.sAlgo.algonaut.getAccountInfo(q);
		console.log('search respo', response);

		// sSearch.loading = false;
		sSearch.response = {
			type: 'account',
			object: response
		};

		// get asset info
		if (sSearch.response.object.assets) {
			sSearch.response.object.assets.map((asset: any) => {
				state.sAlgo.algonaut.getAssetInfo(asset['asset-id']).then((assetInfo: any) => {
					console.log(assetInfo);
					asset.creator = assetInfo.params.creator;
					return asset;
				});
			})
		}
	}
	// lookup app/asset?
	else if (parseInt(q)) {
		// try app
		try {
			response = await state.sAlgo.algonaut.getAppInfo(parseInt(q));
			state.success('App found.');
			// sSearch.loading = false;

			sSearch.response = {
				type: 'app',
				object: response
			};
		} catch (e) {
			// try asset
			try {
				response = await state.sAlgo.algonaut.getAssetInfo(parseInt(q));
				state.success('Asset found: ' + response.params.name);
				// sSearch.loading = false;
				sSearch.response = {
					type: 'asset',
					object: response
				};
			} catch (e) {
				// this means query was an int, but not a valid one...
				console.warn(e);
				// throw e;

				// sSearch.loading = false;
				sSearch.response = {
					type: 'empty',
					message: 'Nothing found.'
				};
				state.error(sSearch.response.message);
			}
		}
		// lookup type unknown...
	} else {
		// this means query was not an int and some unknown type of thing
		sSearch.response = {
			type: 'empty',
			message: 'Not a valid resource.'
		};
		state.error(sSearch.response.message);
		// this.searching = false;
	}

	// always reset loading state (success or err)
	sSearch.loading = false;
};


// op1
// import('./UserCtx').then((file) => {
// 	const uCtx = file.default;

// 	watch(


// op2 (doesnt work)
// (
// 	async () => {
// 		router.isReady().then(() => {

// 		});

// 	}
// )();

// sync route w sSearch state
watch(
	() => router.currentRoute.value.query.s,
	(searchQuery) => {
		console.log('searchQuery changed:', searchQuery);

		if (searchQuery) {
			if (typeof searchQuery == 'string') {
				// console.log('got search param', rc.query.s);

				sSearch.query = searchQuery;
			} else {
				// its an array of strings or something...
				console.warn('bad searchQuery (arr)');
			}
		}
	},
	{
		immediate: false, // happened immediately anyway on first load of router (i think)
		// deep: false // not needed
	}
);

// debounced version of search so we dont send a bunch of unnecessary requests
// const parseQueryDb = debounce(parseQuery, 1000);

//
watch(
	() => sSearch.query,
	async (q, qOld) => {
		if (q) {
			if (q !== qOld) {
				parseQuery(q);

				// test w: http://localhost:3000/testnet?s=93272663&another=things#testing
				let x = await router.nonDestructivePush({
					// params: {},
					query: {
						s: q
						// s: [q, q, q] // works too
					}
				});
				// console.log('post nonDestructivePush', x);
			}

			// old: (good for human input typing, but doesnt account for necessary immediate changes like clicking a link. moved debounce to seperate v-model vue watcher)
			// if (qOld) {
			// 	// debounce search
			// 	if (q !== qOld) {
			// 		parseQueryDb(q)
			// 	}
			// } else {
			// 	// first load, so req immediately
			// 	console.log('first load, so req immediately');
			// 	parseQuery(q);
			// }
		} else {
			// reset
			sSearch.response = null;
			// removes just s query param
			router.nonDestructivePush({
				query: {
					s: undefined
				}
			});
		}
	},
	{
		immediate: false
	}
);

// shim (can remove this assuming we connect to a node like testnet.)
// TODO remove this, but do final local vars for app somehow
// this is here because we need to reload query after sign in to grab local vars
bus.on('signed-in', () => {
	parseQuery(sSearch.query);
});

watch(
	() => sAlgo.connected,
	async (isConnected) => {
		// console.log('sAlgo isConnected', isConnected);

		if (isConnected) {
			if (!sSearch.loading) {
				await parseQuery(sSearch.query);
			} else {
				console.log('sSearch already loading.');
			}
		} else {
			// reset
			sSearch.response = null;
		}
	}
);