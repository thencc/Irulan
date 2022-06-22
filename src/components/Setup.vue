<template>

    <button @click="sAlgo.showSetup = true" class="btn-gray">
        <Status />
    </button>
    <Modal id="setup-modal" :show="sAlgo.showSetup" @close="sAlgo.showSetup = false">
        <h3 class="modal-title">Node Configuration</h3>
        <form @submit.stop.prevent="sAlgo.applySettings">
            <div class="module-content">
                <div class="form-field">
                    <p class="form-label">Ledger</p>
                    <div class="ops-container">
                        <div v-for="l of ledgerOptions" :key="l.id" class="radio-op">
                            <input v-model="sAlgo.config.ledger" :value="l.id" type="radio" name="ledger"
                                :id="`ledger-${l.id}`" xxdisabled="sAlgo.config.useCustomNode" >
                            <label :for="`ledger-${l.id}`">
                                {{ l.label }}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <p class="form-label">Node Configuration</p>
                    <input type="radio" name="node" id="node-default" :value="false"
                        v-model="sAlgo.config.useCustomNode">
                    <label for="node-default">
                        Default
                    </label>

                    <input type="radio" name="node" id="node-custom" :value="true" v-model="sAlgo.config.useCustomNode">
                    <label for="node-custom">
                        Custom Node
                    </label>
                </div>
                <div class="server-config" v-show="sAlgo.config.useCustomNode">
                    <p>
                        <label for="server">Server</label>
                        <input type="text" v-model="sAlgo.config.server" id="server" name="server">
                    </p>
                    <p>
                        <label for="indexer">Indexer</label>
                        <input type="text" v-model="sAlgo.config.indexer" id="indexer" name="indexer">
                    </p>
                    <p>
                        <label for="apiKeyHeaderName">Key Header</label>
                        <input type="text" v-model="sAlgo.config.apiKeyHeaderName" id="apiKeyHeaderName"
                            name="apiKeyHeaderName">
                    </p>
                    <p>
                        <label for="apiKey">API Key</label>
                        <input type="text" v-model="sAlgo.config.apiKey" id="apiKey" name="apiKey">
                    </p>
                    <p>
                        <label for="port">Port</label>
                        <input type="text" v-model="sAlgo.config.port" id="port" name="port">
                    </p>
                    <p class="small formtext">Make sure this server matches the ledger selection above.</p>
                </div>
                <div class="actions align-right">
                    <button class="btn-secondary" type="button" @click.stop.prevent="sAlgo.clearSettings">
                        Clear Saved Settings
                    </button>
                    <button class="btn-main" type="submit" @click.stop.prevent="sAlgo.applySettings">
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
// import { sAlgo } from '../state/modules/sAlgo';

// comps
import Modal from './Modal.vue';
import Status from './Status.vue';

export default defineComponent({
    components: {
        Modal,
        Status
    },
    data() {
        return {
            sAlgo: state.sAlgo, // works, but sAlgo doesnt (load timing issue...)
            // sAlgo: sAlgo,

            ledgerOptions: [
                {
                    id: 'testnet',
                    label: 'Testnet'
                },
                {
                    id: 'mainnet',
                    label: 'Mainnet'
                },
            ],
        }
    },
    mounted() {
        // sAlgo.fetchCachedConfig(); // works
    },
    methods: {
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

.ops-container {
    display: flex;
}

.radio-op {
    display: flex;
    align-items: center;
}

.radio-op>label {
    padding-left: 6px;
    margin-right: 10px;
}
</style>