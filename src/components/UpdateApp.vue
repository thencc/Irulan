<template>
    <button @click="sModal.modalId = 'contract-update'; sModal.width = '70%'">
        Update Contract
    </button>

    <teleport v-if="sModal.modalId == 'contract-update'" to="#modal-teleport-dest">
        <h3 class="modal-title">Update Contract</h3>
        <div class="modal-content">
            <div class="programs">
                <p>(updating app <span class="green">{{ app.index }}</span>)</p>
                <h4 class="purple">Approval Program</h4>
                <textarea name="approvalProgram" id="approvalProgram" cols="30" rows="10"
                    v-model="deployArgs.approvalProgram"></textarea>
                <h4 class="purple">Clear State Program</h4>
                <textarea name="clearStateProgram" id="clearStateProgram" cols="30" rows="10"
                    v-model="deployArgs.clearStateProgram"></textarea>
            </div>
            <div class="args">
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
            <LoadingButton @click="deploy" type="submit" :loading="deployLoading">Update Contract</LoadingButton>
        </p>
    </teleport>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import state from '../state';
import { sModal } from '../state/modules/sModal';

// comps
import ArrayField from './ArrayField.vue';
import LoadingButton from './LoadingButton.vue';

export default defineComponent({
    components: {
        ArrayField,
        LoadingButton
    },
    props: {
        // TODO type this / just use sApp state
        app: {} as any
    },
    data() {
        return {
            state,
            sModal,
            deployLoading: false,
            deployError: '',
            deployArgs: {
                approvalProgram: '',
                clearStateProgram: '',
                args: [],
                optionalFields: {
                    accounts: [],
                    applications: [],
                    assets: []
                }
            }
        }
    },
    watch: {
        'app.approvalDecompiled': {
            immediate: true,
            handler(c) {
                this.deployArgs.approvalProgram = (c || '').replaceAll('\t','');
            }
        },
        'app.clearDecompiled': {
            immediate: true,
            handler(c) {
                this.deployArgs.clearStateProgram = (c || '').replaceAll('\t','');
            }
        },
    },
    methods: {
        close () {
            sModal.close();
            this.deployError = '';
            this.deployLoading = false;

            // reset form
            this.deployArgs = {
                approvalProgram: (this.app.approvalDecompiled || '').replaceAll('\t',''),
                clearStateProgram: (this.app.clearDecompiled || '').replaceAll('\t',''),
                args: [],
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
                let res = await state.sAlgo.algonaut.updateApp({
                    appIndex: this.app.index,
                    tealApprovalCode: this.deployArgs.approvalProgram,
                    tealClearCode: this.deployArgs.clearStateProgram,
                    appArgs: this.deployArgs.args,
                    optionalFields: this.deployArgs.optionalFields
                });
                if (res.status === 'fail') {
                    this.deployError = res.message;
                    state.error('Could not update app.');
                } else {
                    console.log('updated app');
                    console.log(res);
                    let appId;
                    if (res.createdIndex) {
                        appId = res.createdIndex;
                    } else if (res.meta) {
                        appId = res.meta['application-index'];
                    }
                    state.success('Successfully updated! App ID: ' + appId);
                    this.close();

                    console.log('navigating to contract...')
                    if (this.$route.name === 'full' || this.$route.name === 'search') {
                        this.$router.push(`/contract/${appId}/s/${this.$route.params.query}`);
                    } else {
                        this.$router.push(`/contract/${appId}`);
                    }
                }
            } catch (e: any) {
                console.error(e);
                state.error(e);
                this.deployError = e.toString();
                state.error('Error updating app.')
            }
            this.deployLoading = false;
        }
    },
})
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