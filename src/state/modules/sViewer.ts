import { reactive, watch } from 'vue';
import router from '../../router';

import state from '../index';
import { bus } from '../../bus';
// import { debounce } from '../../utils';

// modular states
import { sApp } from './sApp';

// TODO all over this file + elsewhere update to contractId -> appId

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

watch(
	() => router.currentRoute.value,
	(rc) => {
		// console.log('router changed (in sViewer):', rc, router);

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
			sViewer.type = 'contract'; // TODO update to app

			if (appId !== appIdOld) {
				//
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