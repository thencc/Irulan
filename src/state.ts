import { reactive } from 'vue';
import Algonaut from 'algonaut.js';

const TESTNET_SERVER = 'https://twinfrogs.ncc.la/atn/';
const TESTNET_APIKEY = '494d49c48f0f55f5d25d86fabb17bee8fbfcbf818ba257670f4ea076672e0fe2';
const MAINNET_SERVER = 'https://twinfrogs.ncc.la/amn/';
const MAINNET_APIKEY = '3fd53de10f0e2e2b24c4b3a30525a4c94c9b86d7ba9aba64bee01b00ae8b4cc9';


const state = reactive({
    terminal: [] as { type: string, message: string, route?: string }[],
    connected: false,
    connecting: false,
    toolLoading: false,
    currentApp: {} as any,
    isAccount: false,
    indexer: {} as any, 
    activeAccount: null as any,
    algonaut: {} as Algonaut,
    algonautJSCode: '',

    init: async function (config: { ledger: string, server: string, apiKey: string, apiKeyHeaderName: string, useCustomNode: boolean, port: string }) {
        this.connecting = true;
        this.connected = false;

        // the 
        let algoConfig = {
            BASE_SERVER: TESTNET_SERVER,
            LEDGER: config.ledger,
            PORT: '',
            API_TOKEN: { 'X-Algo-API-Token': TESTNET_APIKEY } as any
        };

        if (config.useCustomNode) {
            algoConfig.BASE_SERVER = config.server;
            algoConfig.PORT = config.port;
            config.apiKeyHeaderName = config.apiKeyHeaderName || 'X-API-Key';
            algoConfig.API_TOKEN[config.apiKeyHeaderName] = config.apiKey;
        } else if (!config.useCustomNode && config.ledger && config.ledger.toLowerCase() === 'mainnet') {
            algoConfig.BASE_SERVER = MAINNET_SERVER;
            algoConfig.API_TOKEN['X-Algo-API-Token'] = MAINNET_APIKEY;
        }
        this.algonaut = new Algonaut(algoConfig);

        this.log('Connecting...');

        try {
            const status = await this.algonaut.checkStatus();
            if (status['last-round']) {
                this.success('Connected! Last round: ' + status['last-round'])
                this.connected = true;

                // on success, save config
                localStorage.setItem('config', JSON.stringify(config))

                // if we have an account from WC, set it
                if (this.activeAccount && localStorage.getItem('walletconnect')) {
                    // this.algonaut.setWalletConnectAccount(this.activeAccount);
                    this.algonaut.connectAlgoWallet({ 
                        onConnect: () => { 
                            this.success('Set WalletConnect account: ' + this.activeAccount)
                        },
                        onDisconnect: () => {

                        },
                        onSessionUpdate: () => {

                        }
                    })
                }
            }
        } catch (error) {
            this.error('Error connecting. Check config.');
            this.connected = false;
        }
        this.connecting = false;
    },

    loadApp: async function (appIndex: number) {
        this.toolLoading = true;
        try {
            this.log('Loading app into contract tool...');
            this.currentApp = await this.algonaut.getAppInfo(appIndex);
            this.currentApp.balance = await this.algonaut.getAlgoBalance(this.algonaut.getAppEscrowAccount(appIndex));
        } catch (e) {
            console.log(e);
            this.error('Error loading app.');
        }
        this.toolLoading = false;
    },

    /**
     * Returns a new route to navigate to
     * @param currentRoute Current route object
     * @param toParams Params to update
     */
    getNewRoute(currentRoute: any, toParams: { query?: string, contractId?: string, ledger?: string }) {
        let route = '/' + (currentRoute.params.ledger?.toLowerCase() || 'testnet');

        // replace ledger parameter
        if (toParams.ledger) {
            route = '/' + toParams.ledger;
        }

        // add contract parameter
        if (toParams.contractId) {
            route += '/contract/' + toParams.contractId;
        } else if (currentRoute.name === 'contract' || currentRoute.name === 'full') {
            route += '/contract/' + currentRoute.params.contractId;
        }

        // add search parameter
        if (toParams.query) {
            route += '/s/' + toParams.query;
        } else if (currentRoute.name === 'search' || currentRoute.name === 'full') {
            route += '/s/' + currentRoute.params.query;
        }

        return route;
    },

    /**
     * gets account from local storage depending on ledger
     * @param type local or walletconnect
     * @returns {any} object corresponding to local account or testnet account
     */
    getAccount(type: 'local' | 'walletconnect') {
        const ledger = this.getCurrentLedger();
        return localStorage.getItem(`${type}_${ledger}`)
    },

    saveAccount(type: 'local' | 'walletconnect', account: any) {
        const ledger = this.getCurrentLedger();
        localStorage.setItem(`${type}_${ledger}`, account);
    },

    removeAccount(type: 'local' | 'walletconnect') {
        const ledger = this.getCurrentLedger();
        localStorage.removeItem(`${type}_${ledger}`);
    },

    getCurrentLedger() {
        let ledger;

        // prefer config ledger
        if (this.algonaut.config) {
            ledger = this.algonaut.config.LEDGER.toLowerCase();
        } else {
            // but if we don't have it, grab it from the url
            ledger = window.location.pathname.substring(0, 7).toLowerCase();
        }

        // if something goes wrong, fall back on testnet
        if (ledger !== 'mainnet' && ledger !== 'testnet') {
            ledger = 'testnet';
        }

        return ledger;
    },

    error: function (message: string) {
        this.terminal.unshift({ type: 'error', message });
    },

    log: function(message: string) {
        this.terminal.unshift({ type: 'normal', message });
    },

    logRoute: function(message: string, route: string) {
        this.terminal.unshift({ type: 'link', message, route });
    },

    success: function (message: string) {
        this.terminal.unshift({ type: 'success', message });
    }
});

export default state;