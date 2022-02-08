<template>
<div class="contract-tool" v-if="app">
    <div class="contract-header">
        <div class="contract-info">
            <h2>App <span class="green">{{ app.index }}</span></h2>
            <p class="metadata">
                <span class="creator">
                    <span class="muted">Creator:</span> <span class="purple">{{ app.creatorAddress.substring(0, 10) }}...</span>
                </span>
            </p>
        </div>
        <div class="contract-actions">
            <button @click="closeOut">Close Out</button>
            <button @click="deleteApp" class="btn-danger">Delete App</button>
        </div>
    </div>
    <div class="utilities">
        <div class="utility call-app">
            <h3>Call App</h3>
            <!-- <form @submit.prevent="callApp"> -->
            <div>
                <p><input type="text" v-model="callAppArgs.methodName" placeholder="Method name"></p>
                <h4 class="purple">App Arguments</h4>
                <ArrayField v-model="callAppArgs.appArgs" :placeholder="'Add argument'" />
                <h4 class="purple">Accounts</h4>
                <ArrayField v-model="callAppArgs.accounts" :placeholder="'Add account'" />
                <h4 class="purple">Foreign Applications</h4>
                <ArrayField v-model="callAppArgs.applications" :placeholder="'Add app ID'" />
                <h4 class="purple">Foreign Assets</h4>
                <ArrayField v-model="callAppArgs.assets" :placeholder="'Add app ID'" />
                <p class="align-right"><LoadingButton @click="callApp" type="submit" :loading="callAppLoading">Call App</LoadingButton></p>
            </div>
            <!-- </form> -->
        </div>
        <div class="utility fund-app">
            <h3>Fund App</h3>
            <form @submit.prevent="fundApp">
                <p class="small muted">Escrow address: <span class="purple">{{ escrowAddress }}</span></p>
                <p><input type="number" v-model="fundAppAmt" placeholder="ALGO to send" :disabled="fundAppLoading"></p>
                <!-- <p class="align-right"><button type="submit">Fund App</button></p> -->
                <p class="align-right"><LoadingButton type="submit" :loading="fundAppLoading">Fund App</LoadingButton></p>
            </form>
        </div>
        <div class="utility opt-in">
            <h3>Opt-In to App</h3>
            <!-- <form @submit.prevent="optInApp"> -->
                <h4 class="purple">Arguments</h4>
                <ArrayField v-model="optInArgs" :placeholder="'Argument (press enter to add another)'" />
                <p class="align-right"><button type="button" @click="optInApp">Opt In</button></p>
            <!-- </form> -->

        </div>
    </div>
</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';
import ArrayField from './ArrayField.vue';
import { doTxn } from '../algo';
import LoadingButton from './LoadingButton.vue';

export default defineComponent({
    data() {
        return {
            state,
            callAppArgs: {
                methodName: "",
                appArgs: [],
                accounts: [],
                applications: [],
                assets: []
            },
            fundAppAmt: null,
            optInArgs: [],
            fundAppLoading: false,
            callAppLoading: false,
            closeOutLoading: false,
            optInAppLoading: false,
            deleteAppLoading: false
        };
    },
    computed: {
        app: function () {
            if (state.currentApp && state.currentApp.index) {
                return state.currentApp;
            }
        },
        escrowAddress: function () {
            if (state.currentApp && state.currentApp.index) {
                return state.algonaut.getAppEscrowAccount(state.currentApp.index);
            }
        }
    },
    methods: {
        async callApp() {
            this.callAppLoading = true;
            
            state.log(`Calling app with args: ${JSON.stringify(this.callAppArgs)}`);
            try {
                const res = await doTxn([ 
                    await state.algonaut.atomicCallApp(
                        state.currentApp.index, 
                        [this.callAppArgs.methodName].concat(this.callAppArgs.appArgs)
                    )
                ]);
                if (res.status === 'fail') {
                    state.error(res.message);
                } else {
                    state.log(res.message);
                }
            } catch (e) {
                console.log(e);
                state.error('Error calling app.');
            }

            this.callAppLoading = false;
        },
        async fundApp() {
            if (!this.escrowAddress || !this.fundAppAmt) return false;

            this.fundAppLoading = true;
            console.log(this.fundAppAmt);
            state.log(`Sending ${this.fundAppAmt} to ${this.escrowAddress}`);

            try {
                const res = await doTxn([ await state.algonaut.atomicPayment(this.escrowAddress, this.fundAppAmt) ])
                if (res.status === 'fail') {
                    state.error(res.message);
                } else {
                    state.log(res.message);
                    this.fundAppAmt = null;
                    state.success('Application funded');
                }
            } catch (e) {
                console.log(e);
                state.error('Error funding app.');
            }
            this.fundAppLoading = false;
        },
        async optInApp() {
            this.optInAppLoading = true;
            console.log(this.optInArgs);
            this.optInAppLoading = false;
        },
        async closeOut() {
            this.closeOutLoading = true;
            this.closeOutLoading = false;

        },
        async deleteApp() {
            this.deleteAppLoading = true;
            this.deleteAppLoading = false;

        }
    },
    components: { ArrayField, LoadingButton }
})
</script>
<style lang="scss" scoped>
@import '../assets/variables';
.contract-tool {
    padding: 10px;
}

h2 {
    margin-top: 0;
    padding-top: 10px;
}

.utilities {
    display: flex;
    flex-wrap: wrap;
}

.utility {
    flex: 0 0 50%;
    border: 2px solid $border;
    padding: 10px;

    h3 {
        color: $pink;
        margin: 0;
        padding: 0;
        text-transform: uppercase;
    }

    input {
        width: 100%;
    }
}
</style>