import { reactive, watch } from 'vue';
import router from '../../router';

export const sApp = reactive({
	appId: null as null | number,
	response: null as null | any,
	loading: false,

	reset() {
		sApp.appId = null;
		sApp.response = null;
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




// TODO move route watchers to individual state files?
// so no voodoo is happening as to where the other logic for this file is.

// sync route w sViewer state
// watch(
// 	() => router.currentRoute.value,
// 	(rc) => {
// 		console.log('router changed (in sViewer):', rc, router);

// 		if (rc.params.contractId) {
// 			if (typeof rc.params.contractId == 'string') {
// 				console.log('got params contractId', rc.params.contractId, parseInt(rc.params.contractId));
// 				// sViewer.type = 'contract'; // in watcher
// 				sViewer.contractId = parseInt(rc.params.contractId) || null;
// 			} else {
// 				// its an array of strings or something...
// 				console.warn('param is arr, not string');
// 				sViewer.contractId = null;
// 			}
// 		} else {
// 			sViewer.contractId = null;
// 		}
// 	},
// 	{
// 		// immediate: true, // happened immediately anyway on first load of router (i think)
// 		// deep: false // not needed
// 	}
// );


//
watch(
	() => sApp.appId,
	async (appId, appIdOld) => {
		if (appId) {
			if (appId !== appIdOld) {
				console.warn('TODO loadApp', appId);

				// TODO
				// loadContract (try app + asset)
				// parseQuery(q);

				// router.nonDestructivePush({
				// 	params: {
				// 		contractId: appId.toString()
				// 	},
				// });
			}
		} else {
			// reset
			sApp.response = null;
		}
	},
	{
		immediate: true
	}
);

// watch route
watch(
	() => router.currentRoute.value.params.appId,
	(appId) => {
		if (appId) {
			if (typeof appId == 'string') {
				console.log('sApp got appId from route watcher', appId, parseInt(appId));

				sApp.appId = parseInt(appId) || null;
			} else {
				// its an array of strings or something...
				console.warn('param is arr, not string.');
				sApp.appId = null;
			}
		} else {
			sApp.appId = null;
		}
	}
);