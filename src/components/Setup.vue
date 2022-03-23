<template>
    <button @click="showSetup = true" class="btn-gray">
        <Status />
    </button>
    <Modal id="setup-modal" :show="showSetup" @close="showSetup = false">
        <h3 class="modal-title">Node Configuration</h3>
        <form @submit.stop.prevent="applySettings">
            <div class="module-content">
                <div class="form-field">
                    <p class="form-label">Ledger</p>
                    <input type="radio" name="ledger" id="ledger-testnet" value="TestNet" v-model="config.ledger"> TestNet
                    <input type="radio" name="ledger" id="ledger-mainnet" value="MainNet" v-model="config.ledger"> MainNet
                </div>
                <div class="form-field">
                    <p class="form-label">Node</p>
                    <input type="radio" name="node" id="node-purestake" :value="false" v-model="config.useCustomNode"> PureStake Node
                    <input type="radio" name="node" id="node-custom" :value="true" v-model="config.useCustomNode"> Custom Node
                </div>
                <div class="server-config">
                    <p>
                        <label for="apiKey">API Key</label>
                        <input type="text" v-model="config.apiKey" id="apiKey" name="apiKey">
                    </p>
                    <p v-show="config.useCustomNode">
                        <label for="apiKeyHeaderName">Key Header</label>
                        <input type="text" v-model="config.apiKeyHeaderName" id="apiKeyHeaderName" name="apiKeyHeaderName">
                    </p>
                    <p v-show="config.useCustomNode">
                        <label for="server">Server</label>
                        <input type="text" v-model="config.server" id="server" name="server">
                    </p>
                    <p v-show="config.useCustomNode">
                        <label for="port">Port</label>
                        <input type="text" v-model="config.port" id="port" name="port">
                    </p>
                </div>
                <div class="actions align-right">
                    <button class="btn-secondary" type="button" @click.stop.prevent="clearSettings">
                        Clear Saved Settings
                    </button>
                    <button class="btn-main" type="submit" @click.stop.prevent="applySettings">
                        Apply Settings
                    </button>
                </div>
            </div>
        </form>
    </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';
import Modal from './Modal.vue';
import Status from './Status.vue';

export default defineComponent({
    components: {
        Modal,
        Status
    },
    data() {
        return {
            showSetup: false,
            state,
            config: {
                useCustomNode: false,
                apiKey: '',
                apiKeyHeaderName: 'X-API-Key',
                ledger: 'TestNet',
                port: '',
                server: ''
            }
        }
    },
    mounted() {
        this.fetchCachedConfig();
    },
    watch: {
        $route(to, from) {
            // if (to.params && to.params.ledger && 
            //     from.params && from.params.ledger && 
            //     to.params.ledger !== from.params.ledger) {
            //         console.log(`We were at ${from.params.ledger}, now we are at ${to.params.ledger}`)
            //         // if we came from a different ledger, update settings
            //         this.config.ledger = state.getLedgerFromUrl(this.$route);
            //         state.init(this.config);
            // }
        }
    },
    methods: {
        async applySettings (checkUrl: boolean = false) {
            console.log('applying settings')
            // console.log(window.location.pathname);
            // console.log(this.config.ledger);

            // we don't want to check the URL if we are applying settings from the modal
            if (checkUrl) {
                const path = window.location.pathname.toLowerCase()
                let urlLedger;
                if (path.startsWith('/mainnet')) urlLedger = 'MainNet';
                if (path.startsWith('/testnet')) urlLedger = 'TestNet';

                // this.$route.params is empty at this point, even if we have a URL to parse
                if (urlLedger && this.config.ledger.toLowerCase() !== urlLedger.toLowerCase()) {
                    console.log('Route has different ledger than config')
                    this.config.ledger = urlLedger;
                }
            }
            await state.init(this.config);

            if (!checkUrl) {
                console.log('changing url');
                this.$router.replace({
                    name: this.$route.name || 'home',
                    params: {
                        ledger: this.config.ledger.toLowerCase(),
                        query: this.$route.params.query || undefined,
                        conract: this.$route.params.contract || undefined
                    }
                });
            }
            this.showSetup = false;
        },
        clearSettings () {
            this.config = {
                useCustomNode: false,
                apiKey: '',
                ledger: 'TestNet',
                apiKeyHeaderName: 'X-API-Key',
                port: '',
                server: ''
            }
            localStorage.removeItem('config');
            state.log('Settings cleared');
        },
        fetchCachedConfig() {
            console.log('getting config from cache...')
            const cachedConfig = JSON.parse(localStorage.getItem('config') || '{}');
            if (cachedConfig) {
                this.config = cachedConfig;
                state.log('Fetched settings from local storage.');
                this.applySettings(true);
            } else {
                this.config = {
                    useCustomNode: false,
                    apiKey: '',
                    ledger: 'TestNet',
                    apiKeyHeaderName: 'X-API-Key',
                    port: '',
                    server: ''
                }
            }
        }
    }
})
</script>

<style scoped lang="scss">
@import '../assets/variables';
.server-config p {
    display: flex;
    padding-bottom: 10px;
    margin: 0;

    label {
        flex: 1 1 100px;
        padding-right: 5px;
        line-height: 2em;
        color: $textlight;
    }

    input {
        flex: 1 1 80%;
    }
}
</style>
