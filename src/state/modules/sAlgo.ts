import { reactive, watch } from 'vue';
import Algonaut from 'algonaut.js';
import { AlgonautConfig } from 'algonaut.js/dist/AlgonautTypes';

import state from '../index';
import router from '../../router';

// default node settings (testnet)
const TESTNET_SERVER = 'https://twinfrogs.ncc.la/atn';
const TESTNET_INDEXER = 'https://twinfrogs.ncc.la/atni';
const TESTNET_APIKEY = '494d49c48f0f55f5d25d86fabb17bee8fbfcbf818ba257670f4ea076672e0fe2';
// defaults (mainnet)
const MAINNET_SERVER = 'https://twinfrogs.ncc.la/amn';
const MAINNET_INDEXER = 'https://twinfrogs.ncc.la/amni';
const MAINNET_APIKEY = '3fd53de10f0e2e2b24c4b3a30525a4c94c9b86d7ba9aba64bee01b00ae8b4cc9';

const defaultAlgoConfigTestnet: AlgonautConfig = {
	BASE_SERVER: TESTNET_SERVER,
	INDEX_SERVER: TESTNET_INDEXER,
	LEDGER: 'testnet',
	PORT: '',
	API_TOKEN: { 'X-Algo-API-Token': TESTNET_APIKEY } as Record<string, string>,
};
const defaultAlgoConfigMainnet: AlgonautConfig = {
	BASE_SERVER: MAINNET_SERVER,
	INDEX_SERVER: MAINNET_INDEXER,
	LEDGER: 'mainnet',
	PORT: '',
	API_TOKEN: { 'X-Algo-API-Token': MAINNET_APIKEY } as Record<string, string>,
};

export interface CustomNodeConfig {
	ledger: string,
	server: string,
	indexer: string,
	apiKey: string,
	apiKeyHeaderName: string,
	port: string
	// useCustomNode: boolean, // if theres a localStorage value, it IS a custom node...
};

const algonaut = new Algonaut(defaultAlgoConfigTestnet);

// state
export const sAlgo = reactive({
	algonaut, // helper lib

	ledger: null as null | 'testnet' | 'mainnet',

	// useCustomNode: false,
	// useCustomNode: JSON.parse(localStorage.getItem('node_config_custom') || 'false') as boolean, // assume false
	// config: defaultAlgoConfigTestnet,
	// localstorageconfig? (includes useCustomNode)

	config: {
		useCustomNode: false,
		apiKey: '',
		apiKeyHeaderName: 'X-API-Key',
		ledger: 'testnet',
		port: '',
		server: '',
		indexer: ''
	},
	showSetup: false,

	connected: false,
	connecting: false,
	activeAccount: null as any,

	fetchCachedConfig() {
		console.log('fetchCachedConfig');
		const cachedConfig = JSON.parse(localStorage.getItem('config') || '{}');
		if (cachedConfig && cachedConfig.server) {
			this.config = cachedConfig;
			state.log('Fetched settings from local storage.');
			this.applySettings();
		} else {
			this.config = {
				useCustomNode: false,
				apiKey: '',
				ledger: 'testnet',
				apiKeyHeaderName: 'X-API-Key',
				port: '',
				server: '',
				indexer: ''
			}
			this.applySettings();
		}
	},
	async applySettings() {
		let urlLedger = sAlgo.ledger;
		// console.log('urlLedger', urlLedger);

		if (!urlLedger || typeof urlLedger !== 'string') {
			console.warn('bad ledger param');
			return;
		}

		if (urlLedger !== 'testnet' && urlLedger !== 'mainnet') {
			console.warn('bad ledger type');
			return;
		}

		if (this.config.ledger !== urlLedger) {
			console.log('Route has different ledger than config')
			urlLedger = sAlgo.config.ledger as any;
		}

		await sAlgo.init(this.config);

		router.nonDestructivePush({
			params: {
				// ledger: this.config.ledger
				// ledger: sAlgo.ledger
				ledger: urlLedger as any
			}
		});

		this.showSetup = false;
	},
	clearSettings() {
		this.config = {
			useCustomNode: false,
			apiKey: '',
			ledger: 'testnet',
			apiKeyHeaderName: 'X-API-Key',
			port: '',
			server: '',
			indexer: ''
		}
		localStorage.removeItem('config');
		state.log('Settings cleared');
	},

	init: async function (config: { ledger: string, server: string, indexer: string, apiKey: string, apiKeyHeaderName: string, useCustomNode: boolean, port: string }) {
		this.connecting = true;
		this.connected = false;

		// the
		let algoConfig = {
			BASE_SERVER: TESTNET_SERVER,
			INDEX_SERVER: TESTNET_INDEXER,
			LEDGER: config.ledger,
			PORT: '',
			API_TOKEN: { 'X-Algo-API-Token': TESTNET_APIKEY } as Record<string, string>
		};

		if (config.useCustomNode) {
			algoConfig.BASE_SERVER = config.server;
			algoConfig.INDEX_SERVER = config.indexer;
			algoConfig.PORT = config.port;
			config.apiKeyHeaderName = config.apiKeyHeaderName || 'X-API-Key';
			algoConfig.API_TOKEN = {
				[config.apiKeyHeaderName]: config.apiKey
			};
		} else if (!config.useCustomNode && config.ledger && config.ledger === 'mainnet') {
			algoConfig.BASE_SERVER = MAINNET_SERVER;
			algoConfig.INDEX_SERVER = MAINNET_INDEXER;
			algoConfig.API_TOKEN['X-Algo-API-Token'] = MAINNET_APIKEY;
		}
		// console.log('algoConfig', algoConfig);
		this.algonaut = new Algonaut(algoConfig);
		state.log('Connecting...');

		try {
			const status = await this.algonaut.checkStatus();
			if (status['last-round']) {
				state.success('Connected! Last round: ' + status['last-round']);
				this.connected = true;

				// on success, save config
				localStorage.setItem('config', JSON.stringify(config))

				// if we have an account from WC, set it
				if (this.activeAccount && localStorage.getItem('walletconnect')) {
					// this.algonaut.setWalletConnectAccount(this.activeAccount);
					this.algonaut.connectAlgoWallet({
						onConnect: () => {
							state.success('Set WalletConnect account: ' + this.activeAccount)
						},
						onDisconnect: () => {

						},
						onSessionUpdate: () => {

						}
					})
				}
			}
		} catch (error) {
			state.error('Error connecting. Check config.');
			this.connected = false;
		}
		this.connecting = false;
	},

	// setNode: async function (newConfig: NodeConfig) {
	// setNode: async function (newConfig: AlgonautConfig) {
	// 	console.log('setNode', newConfig);

	// 	this.connected = false;
	// 	this.connecting = true;

	// 	// let algoConfig = defaultAlgoConfigTestnet;

	// 	// custom node?
	// 	// if (newConfig.useCustomNode) {
	// 	// 	algoConfig.BASE_SERVER = newConfig.server;
	// 	// 	algoConfig.INDEX_SERVER = newConfig.indexer;
	// 	// 	algoConfig.LEDGER = newConfig.ledger;
	// 	// 	algoConfig.PORT = newConfig.port;
	// 	// 	algoConfig.API_TOKEN[newConfig.apiKeyHeaderName] = newConfig.apiKey;
	// 	// }
	// 	// // ncc default mainnet node?
	// 	// else if (!newConfig.useCustomNode && newConfig.ledger && newConfig.ledger === 'mainnet') {
	// 	// 	algoConfig.BASE_SERVER = MAINNET_SERVER;
	// 	// 	algoConfig.INDEX_SERVER = MAINNET_INDEXER;
	// 	// 	algoConfig.LEDGER = newConfig.ledger;
	// 	// 	algoConfig.API_TOKEN['X-Algo-API-Token'] = MAINNET_APIKEY;
	// 	// }

	// 	this.algonaut = new Algonaut(newConfig);

	// 	// TODO add back in (everywhere)
	// 	// this.log('Connecting...');

	// 	try {
	// 		const status = await this.algonaut.checkStatus();
	// 		if (status['last-round']) {
	// 			// this.success('Connected! Last round: ' + status['last-round'])
	// 			this.connected = true;

	// 			this.config = newConfig;

	// 			// on success, save config
	// 			// localStorage.setItem('node_config', JSON.stringify(newConfig))

	// 			// TODO check this
	// 			// if we have an account from WC, set it
	// 			if (this.activeAccount && localStorage.getItem('walletconnect')) {
	// 				// this.algonaut.setWalletConnectAccount(this.activeAccount);
	// 				this.algonaut.connectAlgoWallet({
	// 					onConnect: () => {
	// 						// this.success('Set WalletConnect account: ' + this.activeAccount)
	// 					},
	// 					onDisconnect: () => {

	// 					},
	// 					onSessionUpdate: () => {

	// 					}
	// 				})
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error('Error connecting. Check config.');
	// 	} finally {
	// 		this.connecting = false;
	// 	}
	// },

	// fetchCachedConfig() {
	// 	console.log('getting config from cache...')
	// 	let cachedConfig: NodeConfig = JSON.parse(localStorage.getItem('node_config') || '{}');

	// 	if (cachedConfig && cachedConfig.server) {
	// 		state.log('Fetched settings from local storage.');
	// 		// this.config = cachedConfig;
	// 		// this.applySettings();
	// 		this.setNode(cachedConfig);
	// 	} else {
	// 		this.config = {
	// 			useCustomNode: false,
	// 			apiKey: '',
	// 			ledger: 'testnet',
	// 			apiKeyHeaderName: 'X-API-Key',
	// 			port: '',
	// 			server: ''
	// 		};
	// 		this.applySettings();
	// 	}
	// },

	// FYI - on page load logic starts here
	// checkRouteNet() {
	// 	console.log('checkRouteNet');

	// 	let urlLedger = router.currentRoute.value.params.ledger;
	// 	if (!urlLedger || typeof urlLedger !== 'string') {
	// 		console.warn('bad ledger param');
	// 		return;
	// 	}

	// 	if (urlLedger !== 'testnet' && urlLedger !== 'mainnet') {
	// 		console.warn('bad ledger type');
	// 		return;
	// 	}

	// 	// let config = sAlgo.getNodeConfigFor(urlLedger);
	// 	// sAlgo.setNode(config);
	// },

	// getNodeConfigFor(ledger: 'mainnet' | 'testnet') {
	// 	console.log('getNodeConfigFor', ledger);

	// 	if (ledger !== 'testnet' && ledger !== 'mainnet') {
	// 		throw new Error('bad ledger type');
	// 	}

	// 	let algoNodeConfig = defaultAlgoConfigTestnet; // start w testnet default
	// 	let cachedNodeConfigStr = localStorage.getItem('node_config_' + ledger);

	// 	// if theres a cached localstorage val, IT IS a custom node
	// 	if (cachedNodeConfigStr) {
	// 		algoNodeConfig = JSON.parse(cachedNodeConfigStr);
	// 	} else {
	// 		console.log('no previous config, use ncc node default');

	// 		if (ledger == 'mainnet') {
	// 			algoNodeConfig = defaultAlgoConfigMainnet;
	// 		} else if (ledger == 'testnet') {
	// 			algoNodeConfig = defaultAlgoConfigTestnet;
	// 		} else {
	// 			console.warn('this shouldnt happen... check getNodeConfigFor bad ledger:', ledger);
	// 			// assume testnet (shouldnt happen tho)
	// 			algoNodeConfig = defaultAlgoConfigTestnet;
	// 		}
	// 	}

	// 	return algoNodeConfig;
	// },

	// cacheConfig(ledger: 'testnet' | 'mainnet', customConfig: CustomNodeConfig) {
	// 	console.log('cacheConfig', customConfig);

	// 	// localStorage.
	// 	if (ledger !== 'mainnet' && ledger !== 'testnet') {
	// 		console.error('dont save a bad ledger type');
	// 		return;
	// 	}

	// 	localStorage.setItem('node_config_' + ledger, JSON.stringify(customConfig));
	// 	console.log('saved custom config');
	// },

	// async applySettings() {
	// 	console.log('applySettings');

	// 	// we don't want to check the URL if we are applying settings from the modal
	// 	// const path = window.location.pathname.toLowerCase()
	// 	// let urlLedger;
	// 	// if (path.startsWith('/mainnet')) urlLedger = 'mainnet';
	// 	// if (path.startsWith('/testnet')) urlLedger = 'testnet';

	// 	let urlLedger = router.currentRoute.value.params.ledger;
	// 	if (!urlLedger || typeof urlLedger !== 'string') {
	// 		console.warn('bad ledger param');
	// 		return;
	// 	}

	// 	if (urlLedger !== 'testnet' && urlLedger !== 'mainnet') {
	// 		console.warn('bad ledger type');
	// 		return;
	// 	}

	// 	// if this.$route.params is empty, we will prefer the URL ledger because this is a COLD OPEN
	// 	// otherwise, we'll use the config ledger
	// 	// if (!this.$route.params.ledger) {
	// 	if (urlLedger !== this.config.ledger) {
	// 		console.log('Route has different ledger than config')
	// 		this.config.ledger = urlLedger;
	// 	}
	// 	// }

	// 	await state.init(this.config);

	// 	this.$router.replace({
	// 		...this.$route, // makes sure hash stays in URL
	// 		name: this.$route.name || 'home',
	// 		params: {
	// 			...this.$route.params, // makes sure OTHER params stay in URL
	// 			ledger: this.config.ledger,
	// 			// query: this.$route.params.query || undefined,
	// 			// contract: this.$route.params.contract || undefined
	// 		},
	// 		query: {
	// 			...this.$route.query, // makes sure OTHER query params still in URL
	// 		}
	// 	});
	// 	this.showSetup = false;
	// },
	// clearSettings() {
	// 	this.config = {
	// 		useCustomNode: false,
	// 		apiKey: '',
	// 		ledger: 'testnet',
	// 		apiKeyHeaderName: 'X-API-Key',
	// 		port: '',
	// 		server: ''
	// 	}
	// 	localStorage.removeItem('node_config');
	// 	state.log('Settings cleared');
	// },
});

watch(
	() => sAlgo.ledger,
	(ledger) => {
		console.log('ledger changed:', ledger);
		sAlgo.fetchCachedConfig();

		// let algoNodeConfig = sAlgo.getNodeConfigFor(ledger);
		// sAlgo.setNode(algoNodeConfig);
		// // this.config = algoNodeConfig;

		// router.nonDestructivePush({
		// 	params: {
		// 		ledger: sAlgo.ledger
		// 	}
		// });

	},
	{
		immediate: false
	}
);

// watch route for ledger param
watch(
	() => router.currentRoute.value.params.ledger,
	(ledger) => {
		console.log('router param ledger changed:', ledger);

		if (ledger) {
			if (typeof ledger == 'string') {
				// console.log('got ledger param', ledger);

				if (ledger !== 'mainnet' && ledger !== 'testnet') {
					console.warn('bad ledger type in route', ledger);
					return;
				}

				sAlgo.ledger = ledger;
			} else {
				console.warn('bad ledger (arr)');
			}
		} else {
			console.log('reset sAlgo');
			sAlgo.ledger = null;
		}
	},
	{
		immediate: false,
	}
);