import { reactive, watch, markRaw } from 'vue';
import Algonaut from '@thencc/algonautjs';
// import Algonaut from '../../../../algonautjs/dist/index';
// import { AlgonautConfig } from 'algonaut.js/dist/AlgonautTypes';

import state from '../index';
import router from '../../router';
import { bus } from '../../bus';

export interface CustomNodeConfig {
	ledger: NetType,
	server: string,
	indexer: string,
	apiKey: string,
	apiKeyHeaderName: string,
	port: string
	useCustomNode: boolean,
};
export type NetType = 'mainnet' | 'testnet';

// default node settings (testnet)
const TESTNET_SERVER = 'https://node.testnet.algoexplorerapi.io';
const TESTNET_INDEXER = 'https://algoindexer.testnet.algoexplorerapi.io';
const TESTNET_APIKEY = 'application/json';
// defaults (mainnet)
const MAINNET_SERVER = 'https://node.algoexplorerapi.io';
const MAINNET_INDEXER = 'https://algoindexer.algoexplorerapi.io';
const MAINNET_APIKEY = 'application/json';

const baseConfig: CustomNodeConfig = {
	ledger: 'testnet',
	server: '',
	indexer: '',
	apiKey: '',
	apiKeyHeaderName: '',
	port: '',
	useCustomNode: false
};
const defaultConfigTestnet: CustomNodeConfig = {
	...baseConfig,
	ledger: 'testnet',
	server: TESTNET_SERVER,
	indexer: TESTNET_INDEXER,
	apiKey: TESTNET_APIKEY,
	apiKeyHeaderName: 'accept'
};
const defaultConfigMainnet: CustomNodeConfig = {
	...baseConfig,
	ledger: 'mainnet',
	server: MAINNET_SERVER,
	indexer: MAINNET_INDEXER,
	apiKey: MAINNET_APIKEY,
	apiKeyHeaderName: 'accept'
};

const formatConfigForAlgonaut = (config: CustomNodeConfig) => {
	return {
		BASE_SERVER: config.server,
		INDEX_SERVER: config.indexer,
		LEDGER: config.ledger,
		PORT: config.port,
		API_TOKEN: { [config.apiKeyHeaderName]: config.apiKey }
	};
};

// must start w something, defaults w testnet
const algonaut = markRaw(new Algonaut(formatConfigForAlgonaut(defaultConfigTestnet)));
console.log(algonaut);

// state
export const sAlgo = reactive({
	algonaut, // helper lib
	ledger: null as null | 'testnet' | 'mainnet', // the ledger shown in the url
	config: baseConfig, // aka configEditable
	configLocalStorage: false as false | CustomNodeConfig,

	connected: false,
	connecting: false,
	activeAccount: null as null | string,
	hasLocalStorageAcct: false,
	defaultTxnFee: 1000, // 0.001 algo
	algonautJSCode: '',

	// make async isReady field? -- how would it work w stale awaits in various functions + changing net testnet->mainnet etc
	// async isConnected() {
	// 	console.log('isConnected?');
	// },

	getConfigFor(ledger: NetType) {
		console.log('getConfigFor:', ledger);

		if (ledger !== 'mainnet' && ledger !== 'testnet') {
			console.warn('bad ledger / net type');
			throw new Error('bad ledger type');
		}

		let configFromLS = JSON.parse(localStorage.getItem('config') || 'false') as CustomNodeConfig | false;
		this.configLocalStorage = configFromLS;
		// console.log('configFromLS', configFromLS);

		let useCustomNode = false;

		// is there localstorage cache?
		if (this.configLocalStorage) {
			this.config = this.configLocalStorage; // keep for editable fields
			if (this.configLocalStorage.ledger == ledger) {
				if (this.configLocalStorage.useCustomNode) {
					useCustomNode = true;
				}
			} else {
				// mirror node select radio input, so dont select custom if we wont init w it
				this.config.useCustomNode = false;
			}
		}

		// keep editable radio on correct net/ledger (ex: localstorage exists for mainnet, but loads page: ./testnet/app/93272663 )
		sAlgo.config.ledger = ledger;

		let configForInit: CustomNodeConfig;

		if (useCustomNode) {
			// up to the user/dev to put in correct server/key settings for correct net/ledger
			configForInit = this.configLocalStorage as CustomNodeConfig;
		} else {
			if (ledger == 'mainnet') {
				configForInit = defaultConfigMainnet;
			} else if (ledger == 'testnet') {
				configForInit = defaultConfigTestnet;
			} else {
				// this else ever shouldnt happen...
				configForInit = defaultConfigTestnet;
			}
		}

		return configForInit;
	},
	init: async function (ledger: NetType) {
		console.log('sAlgo init:', ledger);

		let config = sAlgo.getConfigFor(ledger);
		let algoConfig = formatConfigForAlgonaut(config);

		this.connecting = true;
		this.connected = false;

		try {
			state.log('Connecting...');
			this.algonaut = markRaw(new Algonaut(algoConfig));

			const status = await this.algonaut.checkStatus();
			if (status['last-round']) {
				state.success('Connected! Last round: ' + status['last-round']);
				this.connected = true;

				// on success, save config
				// localStorage.setItem('config', JSON.stringify(config));

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
		} catch (e) {
			console.warn((e as Error).message);
			state.error('Error connecting. Check config.');
			this.connected = false;
		}
		this.connecting = false;
	},
	async applySettings() {
		console.log('applySettings');

		// save (never saves ncc default config, only user input)
		localStorage.setItem('config', JSON.stringify(sAlgo.config));

		router.nonDestructivePush({
			params: {
				ledger: sAlgo.config.ledger
			}
		});

		// re-init if route doesnt change, otherwise watcher catches it
		if (sAlgo.ledger == sAlgo.config.ledger) {
			await sAlgo.init(sAlgo.config.ledger);
		} else {
			console.warn('NOW push to new ledger router...');
		}
	},
	clearSettings() {
		this.config = baseConfig;
		localStorage.removeItem('config');
		state.log('Settings cleared');
	},

	// account logic
	/**
	 * gets account from local storage depending on ledger
	 * @param type local or walletconnect
	 * @returns {any} object corresponding to local account or testnet account
	 */
	getAccount(type: 'local' | 'walletconnect') {
		let ledger = this.ledger;
		if (ledger) {
			return localStorage.getItem(`${type}_${ledger}`)
		} else {
			return null;
		}
	},
	saveAccount(type: 'local' | 'walletconnect' | 'inkey', account: any) {
		let ledger = this.ledger;
		if (ledger) {
			localStorage.setItem(`${type}_${ledger}`, account);
		}
	},
	removeAccount(type: 'local' | 'walletconnect' | 'inkey') {
		let ledger = this.ledger;
		if (ledger) {
			localStorage.removeItem(`${type}_${ledger}`);
		}
	},
	checkForLocalStorageWallet() {
		let a = this.getAccount('local');
		if (a) {
			this.hasLocalStorageAcct = true;
		} else {
			this.hasLocalStorageAcct = false;
		}
	}
});

watch(
	() => sAlgo.ledger,
	async (ledger) => {
		console.log('ledger changed:', ledger);

		if (ledger) {
			await sAlgo.init(ledger);
		} else {
			// make any necessary resets here
		}

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
		// console.log('ledger (router param) changed:', ledger);

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