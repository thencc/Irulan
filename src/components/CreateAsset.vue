<template>
    <button @click="sModal.modalId = 'create-asset'">
        Create Asset
    </button>

    <teleport v-if="sModal.modalId == 'create-asset'" to="#modal-teleport-dest">
        <h3 class="modal-title">Create Asset</h3>
        <div class="modal-content">
            <div class="properties">
                <label class="purple" for="assetName">Asset Name</label>
                <input id="assetName" name="assetName" type="text" v-model="assetArgs.assetName"
                    placeholder="Asset name">
                <label class="purple" for="symbol">Symbol</label>
                <input id="symbol" name="symbol" type="text" v-model="assetArgs.symbol" placeholder="Asset symbol">
                <label class="purple" for="decimals">Decimals</label>
                <input id="decimals" name="decimals" type="number" v-model="assetArgs.decimals"
                    placeholder="Decimal places">
                <label class="purple" for="amount">Quantity</label>
                <input id="amount" name="amount" type="number" v-model="assetArgs.amount" placeholder="Quantity">
                <label class="purple" for="metaBlock">Note</label>
                <input id="metaBlock" name="metaBlock" type="text" v-model="assetArgs.metaBlock" placeholder="Note">
            </div>
        </div>
        <p class="pink" v-if="deployError">{{ deployError }}</p>
        <p class="green" v-if="deployStatus">{{ deployStatus }}</p>
        <p class="align-right">
            <LoadingButton @click="deploy" type="submit" :loading="deployLoading">Deploy Asset</LoadingButton>
        </p>
    </teleport>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

import router from '../router';
import state from '../state';
import { sModal } from '../state/modules/sModal';

// components
import LoadingButton from './LoadingButton.vue'

export default defineComponent({
    components: {
        LoadingButton
    },
    data() {
        return {
            sModal,

            deployError: false,
            deployLoading: false,
            deployStatus: '',
            assetArgs: {
                assetName: '',
                symbol: '',
                decimals: 3,
                amount: 0,
                metaBlock: ''
            }
        }
    },
    methods: {
        async deploy () {
            this.deployLoading = true;
            this.deployStatus = 'Waiting for signature...';
            let res = await state.sAlgo.algonaut.createAsset(this.assetArgs, {
                onSign: this.onSign,
                onSend: this.onSend,
                onConfirm: this.onConfirm
            });
            let assetId;
            if (res.createdIndex) {
                assetId = res.createdIndex;
            } else if (res.meta) {
                assetId = res.meta['asset-index'];
            }
            state.success(`Created asset: ${assetId}`);
            this.close();
            router.nonDestructivePush({
                query: {
                    s: assetId
                }
            });
        },
        onSign() {
            this.deployStatus = 'Sending transaction...'
        },
        onSend() {
            this.deployStatus = 'Waiting for confirmation...';
        },
        onConfirm() {
            this.deployStatus = '';
        },
        close() {
            sModal.close();

            // reset form
            this.assetArgs = {
                assetName: '',
                symbol: '',
                decimals: 3,
                amount: 0,
                metaBlock: ''
            };
        }
    },

})
</script>
<style lang="scss" scoped>

label {
    margin: 1em 0 5px;
    display: block;
}

input {
    width: 100%;
}

.schema .field {
    display: flex;

    label {
        flex: 0 1 100px;
        height: 40px;
        line-height: 40px;
    }

    input {
        font-size: 95%;
        flex: 1 1 80%;
    }
}

.schema input {
    font-size: 95%;
}

.args {
    flex: 1 1 50%;
}
</style>