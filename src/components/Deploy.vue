<template>
    <button @click="sModal.modalId = 'contract-deploy'; sModal.width = '70%'">
        Deploy Contract
    </button>

    <teleport v-if="sModal.modalId == 'contract-deploy'" to="#modal-teleport-dest">
        <h3 class="modal-title">Deploy Contract</h3>
        <div class="modal-content">
            <div class="programs">
                <h4 class="purple">Approval Program</h4>
                <textarea name="approvalProgram" id="approvalProgram" cols="30" rows="10"
                    v-model="deployArgs.approvalProgram"></textarea>
                <h4 class="purple">Clear State Program</h4>
                <textarea name="clearStateProgram" id="clearStateProgram" cols="30" rows="10"
                    v-model="deployArgs.clearStateProgram"></textarea>
            </div>
            <div class="args">
                <div class="schema">
                    <h4 class="purple">Schema</h4>
                    <p class="small muted field"><label for="localInts">localInts: </label><input type="number"
                            v-model="deployArgs.schema.localInts" placeholder="localInts" id="localInts"
                            name="localInts"></p>
                    <p class="small muted field"><label for="localBytes">localBytes: </label><input type="number"
                            v-model="deployArgs.schema.localBytes" placeholder="localBytes" id="localBytes"
                            name="localBytes"></p>
                    <p class="small muted field"><label for="globalInts">globalInts: </label><input type="number"
                            v-model="deployArgs.schema.globalInts" placeholder="globalInts" id="globalInts"
                            name="globalInts"></p>
                    <p class="small muted field"><label for="globalBytes">globalBytes: </label><input type="number"
                            v-model="deployArgs.schema.globalBytes" placeholder="globalBytes" id="globalBytes"
                            name="globalBytes"></p>
                </div>
                <h4 class="purple">Arguments</h4>
                <ArrayField v-model="deployArgs.args" :placeholder="'Add argument'" />
                <h4 class="purple">Accounts</h4>
                <ArrayField v-model="deployArgs.optionalFields.accounts" :placeholder="'Add account'" />
                <h4 class="purple">Foreign Applications</h4>
                <ArrayField v-model="deployArgs.optionalFields.applications" :placeholder="'Add app ID'" />
                <h4 class="purple">Foreign Assets</h4>
                <ArrayField v-model="deployArgs.optionalFields.assets" :placeholder="'Add app ID'" />
            </div>
        </div>
        <p class="pink" v-if="deployError">{{ deployError }}</p>
        <p class="align-right">
            <LoadingButton @click="deploy" type="submit" :loading="deployLoading">Deploy Contract</LoadingButton>
        </p>
    </teleport>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import ArrayField from './ArrayField.vue';
import LoadingButton from './LoadingButton.vue';

import router from '../router';
import state from '../state';
import { sModal } from '../state/modules/sModal';
// import { approvalProgram, clearProgram, schema } from './deploy-test';

// uncomment to load test contract
// const TESTDATA = true;
const TESTDATA = false;

export default defineComponent({
    components: {
        ArrayField,
        LoadingButton
    },
    data() {
        return {
            sModal,

            deployLoading: false,
            deployError: '',
            deployArgs: {
                approvalProgram: '',
                clearStateProgram: '',
                args: [],
                schema: {
                    localInts: NaN,
                    localBytes: NaN,
                    globalInts: NaN,
                    globalBytes: NaN
                },
                optionalFields: {
                    accounts: [],
                    applications: [],
                    assets: []
                }
            }
        }
    },
    mounted () {
        // if (TESTDATA) {
        //     this.deployArgs.approvalProgram = approvalProgram;
        //     this.deployArgs.clearStateProgram = clearProgram;
        //     this.deployArgs.schema = schema;
        // }
    },
    methods: {
        close () {
            sModal.close();
            this.deployError = '';
            this.deployLoading = false;

            // reset form
            this.deployArgs = {
                approvalProgram: '',
                clearStateProgram: '',
                args: [],
                schema: {
                    localInts: NaN,
                    localBytes: NaN,
                    globalInts: NaN,
                    globalBytes: NaN
                },
                optionalFields: {
                    accounts: [],
                    applications: [],
                    assets: []
                }
            }
        },
        async deploy () {
            if (!state.sAlgo.algonaut.account) return state.error('No account connected.');
            this.deployLoading = true;
            this.deployError = '';
            state.log('Deploying application...');

            try {
                let res;
                if (state.sAlgo.algonaut.config?.SIGNING_MODE === 'walletconnect') {
                    // sign via WC
                    const txn = await state.sAlgo.algonaut.atomicCreateApp({
                        tealApprovalCode: this.deployArgs.approvalProgram,
                        tealClearCode: this.deployArgs.clearStateProgram,
                        appArgs: this.deployArgs.args,
                        schema: this.deployArgs.schema,
                        optionalFields: this.deployArgs.optionalFields
                    });
                    res = await state.sAlgo.algonaut.sendTransaction([txn]);
                } else {
                    res = await state.sAlgo.algonaut.createApp({
                        tealApprovalCode: this.deployArgs.approvalProgram,
                        tealClearCode: this.deployArgs.clearStateProgram,
                        appArgs: this.deployArgs.args,
                        schema: this.deployArgs.schema,
                        optionalFields: this.deployArgs.optionalFields
                    });
                }
                if (res.status === 'fail') {
                    this.deployError = res.message;
                    state.error('Could not deploy app.');
                } else {
                    console.log('deployed app');
                    console.log(res);
                    let appId;
                    if (res.createdIndex) {
                        appId = res.createdIndex;
                    } else if (res.meta) {
                        appId = res.meta['application-index'];
                    }

                    state.success('Successfully deployed! App ID: ' + appId);

                    this.close();

                    if (appId) {
                        console.log('navigating to contract...')
                        router.nonDestructivePush({
                            name: 'DashApp',
                            params: {
                                appId
                            }
                        });
                    }
                }
            } catch (e: any) {
                console.error(e);
                state.error(e);
                this.deployError = e.toString();
                state.error('Error deploying app.')
            }
            this.deployLoading = false;
        }
    }
});
</script>

<style lang="scss" scoped>
.modal-content {
    display: flex;
}

.programs {
    flex: 1 1 50%;
    margin-right: 20px;

    textarea {
        width: 100%;
    }
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