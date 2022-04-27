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
                    <input type="radio" name="ledger" id="ledger-testnet" value="testnet" v-model="config.ledger"> Testnet
                    <input type="radio" name="ledger" id="ledger-mainnet" value="mainnet" v-model="config.ledger"> Mainnet
                </div>
                <div class="form-field">
                    <p class="form-label">Node Configuration</p>
                    <input type="radio" name="node" id="node-default" :value="false" v-model="config.useCustomNode"> Default
                    <input type="radio" name="node" id="node-custom" :value="true" v-model="config.useCustomNode"> Custom Node
                </div>
                <div class="server-config" v-show="config.useCustomNode">
                    <p>
                        <label for="apiKey">API Key</label>
                        <input type="text" v-model="config.apiKey" id="apiKey" name="apiKey">
                    </p>
                    <p>
                        <label for="apiKeyHeaderName">Key Header</label>
                        <input type="text" v-model="config.apiKeyHeaderName" id="apiKeyHeaderName" name="apiKeyHeaderName">
                    </p>
                    <p>
                        <label for="server">Server</label>
                        <input type="text" v-model="config.server" id="server" name="server">
                    </p>
                    <p class="small formtext">Make sure this server matches the ledger selection above.</p>
                    <p>
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
                ledger: 'testnet',
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
        async applySettings () {
            // we don't want to check the URL if we are applying settings from the modal
            const path = window.location.pathname.toLowerCase()
            let urlLedger;
            if (path.startsWith('/mainnet')) urlLedger = 'mainnet';
            if (path.startsWith('/testnet')) urlLedger = 'testnet';

            // if this.$route.params is empty, we will prefer the URL ledger because this is a COLD OPEN
            // otherwise, we'll use the config ledger
            if (!this.$route.params.ledger) {
                if (urlLedger && this.config.ledger !== urlLedger) {
                    console.log('Route has different ledger than config')
                    this.config.ledger = urlLedger;
                }
            }

            await state.init(this.config);

            this.$router.replace({
                name: this.$route.name || 'home',
                params: {
                    ledger: this.config.ledger,
                    query: this.$route.params.query || undefined,
                    conract: this.$route.params.contract || undefined
                }
            });
            this.showSetup = false;
        },
        clearSettings () {
            this.config = {
                useCustomNode: false,
                apiKey: '',
                ledger: 'testnet',
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
                    server: ''
                }
                this.applySettings();
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
