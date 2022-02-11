import { reactive } from 'vue';
import Algonaut from 'algonaut.js';

const state = reactive({
    terminal: [] as { type: string, message: string }[],
    connected: false,
    connecting: false,
    toolLoading: false,
    currentApp: {} as any,
    isAccount: false,
    activeAccount: null as any,
    signingMode: '' as 'sk' | 'wc',
    algonaut: {} as Algonaut,
    algonautJSCode: '',

    init: async function (config: { ledger: string, server: string, apiKey: string, apiKeyHeaderName: string, useCustomNode: boolean, port: string }) {
        this.connecting = true;
        this.connected = false;
        let algoConfig = {
            BASE_SERVER: 'https://testnet-algorand.api.purestake.io/ps2',
            LEDGER: config.ledger,
            PORT: '',
            API_TOKEN: {} as any
        };

        config.apiKeyHeaderName = config.apiKeyHeaderName || 'X-API-Key';

        algoConfig.API_TOKEN[config.apiKeyHeaderName] = config.apiKey;

        if (config.useCustomNode) {
            algoConfig.BASE_SERVER = config.server;
            algoConfig.PORT = config.port;
        } else if (!config.useCustomNode && config.ledger === 'MainNet') {
            algoConfig.BASE_SERVER = 'https://mainnet-algorand.api.purestake.io/ps2';
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
            this.currentApp = await this.algonaut.getAppInfo(appIndex);
            this.log('Loading app into contract tool...');
        } catch (e) {
            console.log(e);
            this.error('Error loading app.');
        }
        this.toolLoading = false;
    },

    error: function (message: string) {
        this.terminal.unshift({ type: 'error', message });
    },

    log: function(message: string) {
        this.terminal.unshift({ type: 'normal', message });
    },

    success: function (message: string) {
        this.terminal.unshift({ type: 'success', message });
    }
});

export default state;