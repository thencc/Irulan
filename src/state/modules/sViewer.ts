import { reactive, watch } from 'vue';
import router from '../../router';

import state from '../index';
import { bus } from '../../bus';
// import { debounce } from '../../utils';

// modular states
import { sApp } from './sApp';

export const sViewer = reactive({
	// TODO make type a computed field like tables/PresenceCtx.ts reactive ...toRefs trick
	// + can make computed currentViewObj?
	type: '' as '' | 'contract', // 'app' | 'asset' | 'block' | 'transaction' | 'address' , // etc...

	// viewers
	sApp,

	contractId: null as null | number, // not null IF type=='contract'
	appId: null as null | number, // not null IF type=='contract'

	query: '',
	// queryFound: '' as string | number, // appId / address / etc (or use response below?)
	response: null as null | any, // TODO type... something like: { type: 'account' | 'asset' | 'app', object: AppState, Account, Asset }
	loading: false,

	reset() {
		sViewer.type = '';
		sViewer.contractId = null;
	}
});

// const parseQuery = async (q: string) => {
// 	console.log('parseQuery', q);

// 	if (!sSearch.query && q) {
// 		// can also account for this using a custom debounce timer like in tables/Account.ts/watch/usernameNew
// 		console.warn('dont do a delayed search because there nothing to search for (user likely deleted last char in search input)');
// 		return;
// 	}

// 	// const route = state.getNewRoute(this.$route, { query: this.query });
// 	// this.$router.push(route);
// 	sSearch.loading = true;

// 	sSearch.response = null; // reset
// 	var response = {} as any;

// 	// TODO add back in... (make this an emit?)
// 	// state.logRoute(`Searching: ${this.query}`, route);

// 	// console.log('pre-lookup', state.algonaut.sdk);
// 	console.log('pre-lookup:', state.sAlgo.algonaut.config?.BASE_SERVER);

// 	// look account?
// 	// if (state.algonaut.sdk?.isValidAddress(q)) { // old
// 	if (state.sAlgo.algonaut.sdk?.isValidAddress(q)) { // new
// 		console.log('doing account lookup');

// 		// state.success('Account found.'); // TODO add back in
// 		response = await state.sAlgo.algonaut.getAccountInfo(q);
// 		console.log('search respo', response);

// 		// sSearch.loading = false;
// 		sSearch.response = {
// 			type: 'account',
// 			object: response
// 		};

// 		// get asset info
// 		if (sSearch.response.object.assets) {
// 			sSearch.response.object.assets.map((asset: any) => {
// 				state.sAlgo.algonaut.getAssetInfo(asset['asset-id']).then((assetInfo: any) => {
// 					console.log(assetInfo);
// 					asset.creator = assetInfo.params.creator;
// 					return asset;
// 				});
// 			})
// 		}
// 	}
// 	// lookup app/asset?
// 	else if (parseInt(q)) {
// 		// try app
// 		try {
// 			response = await state.sAlgo.algonaut.getAppInfo(parseInt(q));
// 			state.success('App found.');
// 			// sSearch.loading = false;

// 			sSearch.response = {
// 				type: 'app',
// 				object: response
// 			};
// 		} catch (e) {
// 			// try asset
// 			try {
// 				response = await state.sAlgo.algonaut.getAssetInfo(parseInt(q));
// 				state.success('Asset found: ' + response.params.name);
// 				// sSearch.loading = false;
// 				sSearch.response = {
// 					type: 'asset',
// 					object: response
// 				};
// 			} catch (e) {
// 				// this means query was an int, but not a valid one...
// 				console.warn(e);
// 				// throw e;

// 				// sSearch.loading = false;
// 				sSearch.response = {
// 					type: 'empty',
// 					message: 'Nothing found.'
// 				};
// 				state.error(sSearch.response.message);
// 			}
// 		}
// 		// lookup type unknown...
// 	} else {
// 		// this means query was not an int and some unknown type of thing
// 		sSearch.response = {
// 			type: 'empty',
// 			message: 'Not a valid resource.'
// 		};
// 		state.error(sSearch.response.message);
// 		// this.searching = false;
// 	}

// 	// always reset loading state (success or err)
// 	sSearch.loading = false;
// };

// sync route w sViewer state

watch(
	() => router.currentRoute.value,
	(rc) => {
		console.log('router changed (in sViewer):', rc, router);

		/*
		if (rc.params.appId) {
			if (typeof rc.params.appId == 'string') {
				console.log('got params appId', rc.params.appId, parseInt(rc.params.appId));
				// sViewer.type = 'contract'; // in watcher
				sViewer.appId = parseInt(rc.params.appId) || null;
				sApp.appId = parseInt(rc.params.appId) || null;
			} else {
				// its an array of strings or something...
				console.warn('param is arr, not string');
				sViewer.appId = null;
				sApp.appId = null;
			}
		} else {
			sViewer.appId = null;
			sApp.appId = null;
		}
		*/


		// TODO rename contractId -> appId
		// if (rc.params.contractId) {
		// 	if (typeof rc.params.contractId == 'string') {
		// 		console.log('got params contractId', rc.params.contractId, parseInt(rc.params.contractId));
		// 		// sViewer.type = 'contract'; // in watcher
		// 		sViewer.contractId = parseInt(rc.params.contractId) || null;
		// 	} else {
		// 		// its an array of strings or something...
		// 		console.warn('param is arr, not string');
		// 		sViewer.contractId = null;
		// 	}
		// } else {
		// 	sViewer.contractId = null;
		// }

		// else if (rc.params.appId) {
		// 	console.warn('TODO');
		// } else if (rc.params.assetId) {
		// 	console.warn('TODO');
		// }

		// else {
		// 	console.warn('RESET sViewer');
		// 	sViewer.reset();
		// }
	},
	{
		// immediate: true, // happened immediately anyway on first load of router (i think)
		// deep: false // not needed
	}
);

// debounced version of search so we dont send a bunch of unnecessary requests
// const parseQueryDb = debounce(parseQuery, 1000);

//
watch(
	() => sViewer.appId,
	async (appId, appIdOld) => {
		if (appId) {
			sViewer.type = 'contract'; // TODO update

			if (appId !== appIdOld) {
				console.warn('TODO loadContract');

				// TODO
				// loadContract (try app + asset)
				// parseQuery(q);

				router.nonDestructivePush({
					params: {
						appId: appId.toString()
					},
				});
			}
		} else {
			// reset
			sViewer.response = null;
		}
	},
	{
		immediate: true
	}
);