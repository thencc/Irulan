import { reactive, watch } from 'vue';
import router from '../../router';

import state from '../index';
import { bus } from '../../bus';

export const sSearch = reactive({
	query: '',
	// queryFound: '' as string | number, // appId / address / etc (or use response below?)
	response: null as null | any, // TODO type... something like: { type: 'account' | 'asset' | 'app', object: AppState, Account, Asset }
	loading: false,
});

const parseQuery = async (q: string) => {
	console.log('parseQuery', q);
	console.log(sSearch);

	// const route = state.getNewRoute(this.$route, { query: this.query });
	// this.$router.push(route);
	sSearch.loading = true;

	sSearch.response = null; // reset
	var response = {} as any;

	// TODO add back in... (make this an emit?)
	// state.logRoute(`Searching: ${this.query}`, route);

	console.log('pre-lookup', state.algonaut.sdk);
	console.log('pre-lookup', state.sAlgo.algonaut.config?.BASE_SERVER);

	// look account?
	// if (state.algonaut.sdk?.isValidAddress(q)) { // old
	if (state.sAlgo.algonaut.sdk?.isValidAddress(q)) { // new
		console.log('doing account lookup');

		// state.success('Account found.'); // TODO add back in
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
			}
		} catch (e) {
			// try asset
			try {
				response = await state.sAlgo.algonaut.getAssetInfo(parseInt(q));
				state.success('Asset found: ' + response.params.name);
				// sSearch.loading = false;
				sSearch.response = {
					type: 'asset',
					object: response
				}
			} catch (e) {
				// this means query was an int, but not a valid one...
				console.warn(e);
				// throw e;

				// sSearch.loading = false;
				sSearch.response = {
					type: 'empty',
					message: 'Nothing found.'
				}
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

// sync route w sSearch state
watch(
	() => router.currentRoute.value,
	(rc) => {
		console.log('router changed (in sSearch):', rc, router);

		if (rc.query.s) {
			if (typeof rc.query.s == 'string') {
				console.log('got modal search param', rc.query.s);

				// TODO update getNewRoute to not override params + query like in Setup.vue > .applySettings()
				sSearch.query = rc.query.s;
			} else {
				// its an array of strings or something...
				console.warn('bad modal query string');
			}
		}
	},
	{
		immediate: true, // happened immediately anyway on first load of router (i think)
		// deep: false // not needed
	}
);

//
watch(
	() => sSearch.query,
	(q) => {
		if (q) {
			parseQuery(q);
		}
	},
	{
		immediate: true
	}
);
// shim (can remove this assuming we connect to a node like testnet.)
bus.on('signed-in', () => {
	parseQuery(sSearch.query);
});