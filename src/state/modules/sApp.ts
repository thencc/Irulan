import { reactive, watch } from 'vue';
import router from '../../router';
import state from '../index';
import { sAlgo } from './sAlgo';

export const sApp = reactive({
	appId: null as null | number,
	currentApp: null as null | any,
	loading: false,

	reset() {
		sApp.appId = null;
		sApp.currentApp = null;
	},

	loadApp: async function (appId: number) {
		console.log('loadApp', appId);
		this.loading = true;
		try {
			state.log('Loading app into contract tool...');
			this.currentApp = await state.sAlgo.algonaut.getAppInfo(appId);
			this.currentApp.balance = await state.sAlgo.algonaut.getAlgoBalance(state.sAlgo.algonaut.getAppEscrowAccount(appId));
			let moreAppDeets = await this.getMoreAppData(appId);
			this.currentApp.approvalDecompiled = moreAppDeets.params['decompiled-approval-program'];
			this.currentApp.clearDecompiled = moreAppDeets.params['decompiled-clear-state-program'];
		} catch (e) {
			console.log(e);
			state.error('Error loading app.');
		}
		this.loading = false;
	},

	// temp method, gets decompiled teal from algoexplorer (indexer will have decompiled get soon)
	async getMoreAppData(appId: number) {
		// `https://indexer.algoexplorerapi.io/v2/applications/740582846?include-all=true`
		// `https://indexer.testnet.algoexplorerapi.io/v2/applications/740582846?include-all=true`
		const url = `https://indexer${state.sAlgo.algonaut.config?.LEDGER == 'testnet' ? '.testnet' : ''}.algoexplorerapi.io/v2/applications/${appId}?include-all=true`;
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error('err getMoreAppData res');
		}
		const json = await res.json();
		// console.log('json', json);

		const app = json.application;
		if (!app) {
			throw new Error('err getMoreAppData no app');
		}
		return app;
	},

	getDashAppRoute(appId: number) {
		// console.log('getDashAppRoute', appId);
		// keeps query strings + other params
		return router.nonDestructiveResolve({
			name: 'DashApp',
			params: {
				appId: appId.toString()
			}
		});
	},
});

//
watch(
	() => sApp.appId,
	async (appId, appIdOld) => {
		if (appId) {
			if (appId !== appIdOld) {
				await sApp.loadApp(appId);
			}
		} else {
			// reset
			sApp.currentApp = null;
		}
	},
	{
		immediate: true
	}
);

// watch route
// importing router this way gets around using router before initialization err
import('../../router').then((routerFile) => {
	const routerF = routerFile.default;
	// could do this:
	// watch(
	// 	() => routerF.currentRoute.value.params.appId,
	// but really... router should just be available after this file import promise

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
		},
		{
			immediate: true
		}
	);

	// reload app + search + everything on ledger/net change
	// works only after router import is loaded (and using state.sAlgo not sAlgo)
	watch(
		// () => sAlgo.connected, // doesnt work - breaks vue reactivity
		() => state.sAlgo.connected, // works
		async (isConnected) => {
			// console.log('sAlgo isConnected', isConnected);

			if (isConnected) {
				if (sApp.appId) {
					if (!sApp.loading) {
						// happen on first page load
						// reload
						await sApp.loadApp(sApp.appId);
					} else {
						console.log('sApp already loading app');
					}
				}
			} else {
				// reset
				sApp.currentApp = null;
			}
		}
	);
});