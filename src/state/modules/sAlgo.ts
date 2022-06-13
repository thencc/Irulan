import { reactive, watch } from 'vue';
import Algonaut from 'algonaut.js';

// import router from '../../router';
// import state from '../index';
// import { bus } from '../../bus';

// default node settings
const TESTNET_SERVER = 'https://twinfrogs.ncc.la/atn';
const TESTNET_INDEXER = 'https://twinfrogs.ncc.la/atni';
const TESTNET_APIKEY = '494d49c48f0f55f5d25d86fabb17bee8fbfcbf818ba257670f4ea076672e0fe2';
const MAINNET_SERVER = 'https://twinfrogs.ncc.la/amn';
const MAINNET_INDEXER = 'https://twinfrogs.ncc.la/amni';
const MAINNET_APIKEY = '3fd53de10f0e2e2b24c4b3a30525a4c94c9b86d7ba9aba64bee01b00ae8b4cc9';

const defaultAlgoConfigTestnet = {
	BASE_SERVER: TESTNET_SERVER,
	INDEX_SERVER: TESTNET_INDEXER,
	LEDGER: 'testnet',
	PORT: '',
	API_TOKEN: { 'X-Algo-API-Token': TESTNET_APIKEY } as Record<string, string>
};
const algonaut = new Algonaut(defaultAlgoConfigTestnet);

// state
export const sAlgo = reactive({
	algonaut, // helper lib
	config: defaultAlgoConfigTestnet,
	// localstorageconfig? (includes useCustomNode)
	connected: false,
	connecting: false,
	activeAccount: null as any,

	setNode: async function (newConfig: {
		ledger: string,
		server: string,
		indexer: string,
		apiKey: string,
		apiKeyHeaderName: string,
		useCustomNode: boolean,
		port: string
	}) {
		this.connecting = true;
		this.connected = false;

		let algoConfig = defaultAlgoConfigTestnet;

		// custom node?
		if (newConfig.useCustomNode) {
			algoConfig.BASE_SERVER = newConfig.server;
			algoConfig.INDEX_SERVER = newConfig.indexer;
			algoConfig.LEDGER = newConfig.ledger;
			algoConfig.PORT = newConfig.port;
			algoConfig.API_TOKEN[newConfig.apiKeyHeaderName] = newConfig.apiKey;
		}
		// ncc default mainnet node?
		else if (!newConfig.useCustomNode && newConfig.ledger && newConfig.ledger === 'mainnet') {
			algoConfig.BASE_SERVER = MAINNET_SERVER;
			algoConfig.INDEX_SERVER = MAINNET_INDEXER;
			algoConfig.LEDGER = newConfig.ledger;
			algoConfig.API_TOKEN['X-Algo-API-Token'] = MAINNET_APIKEY;
		}
		this.algonaut = new Algonaut(algoConfig);

		// TODO add back in (everywhere)
		// this.log('Connecting...');

		try {
			const status = await this.algonaut.checkStatus();
			if (status['last-round']) {
				// this.success('Connected! Last round: ' + status['last-round'])
				this.connected = true;

				// on success, save config
				localStorage.setItem('config', JSON.stringify(newConfig))

				// TODO check this
				// if we have an account from WC, set it
				if (this.activeAccount && localStorage.getItem('walletconnect')) {
					// this.algonaut.setWalletConnectAccount(this.activeAccount);
					this.algonaut.connectAlgoWallet({
						onConnect: () => {
							// this.success('Set WalletConnect account: ' + this.activeAccount)
						},
						onDisconnect: () => {

						},
						onSessionUpdate: () => {

						}
					})
				}
			}
		} catch (error) {
			console.error('Error connecting. Check config.');
			// this.error('Error connecting. Check config.');
		} finally {
			this.connecting = false;
		}
	},
});
