<template>
    <div class="contract-tool" v-if="app">
        <div class="contract-header">
            <div class="contract-info">
                <div style="display: flex; align-items: center;">
                    <h2>App <span class="green link" xxclick="browserLink(app.index)">{{ app.index }}</span></h2>
                    <div style="flex-grow: 1"></div>
                    <UpdateApp :app="app" />
                    <LoadingButton @click="deleteApp" class="btn-danger" :loading="deleteAppLoading">Delete App
                    </LoadingButton>
                </div>

                <p class="metadata">
                    <span class="creator">
                        <span class="muted">Creator: </span>
                        <span class="purple link" xxclick="browserLink(app.creatorAddress)">
                            {{ utils.shortAddr(app.creatorAddress) }}
                        </span>
                    </span>
                </p>
            </div>
            <!-- <div class="contract-actions">
            <UpdateApp :app="app" />
            <LoadingButton @click="deleteApp" class="btn-danger" :loading="deleteAppLoading">Delete App</LoadingButton>
        </div> -->
        </div>
        <div class="utilities">
            <div class="left-col">
                <div class="utility call-app">
                    <h3>App Operations</h3>
                    <!-- <form @submit.prevent="callApp"> -->
                    <div>
                        Transaction type:
                        <select v-model="callAppArgs.operationType" name="operationType" id="operationType">
                            <option value="callApp">Call App</option>
                            <option value="optInApp">Opt-In App</option>
                            <option value="closeOutApp">Close Out App</option>
                        </select>
                        <div class="method-name" v-if="callAppArgs.operationType === 'callApp'">
                            <p><input type="text" v-model="callAppArgs.methodName" placeholder="Method name"></p>
                            <p class="small muted">(method name gets prepended to arguments array)</p>
                        </div>
                        <h4 class="purple">
                            <span>
                                Arguments
                            </span>
                            <span v-if="callAppArgs.appArgs.length" class="small muted">
                                ({{callAppArgs.appArgs.length}})
                            </span>
                        </h4>
                        <ArrayField v-model="callAppArgs.appArgs" :placeholder="'Add argument'" />
                        <h4 class="purple">
                            <span>
                                Accounts
                            </span>
                            <span v-if="callAppArgs.accounts.length" class="small muted">
                                ({{ callAppArgs.accounts.length}})
                            </span>
                        </h4>
                        <ArrayField v-model="callAppArgs.accounts" :placeholder="'Add account'" />
                        <h4 class="purple">
                            <span>
                                Foreign Applications
                            </span>
                            <span v-if="callAppArgs.applications.length" class="small muted">
                                ({{ callAppArgs.applications.length}})
                            </span>
                        </h4>
                        <ArrayField v-model="callAppArgs.applications" :placeholder="'Add app ID'" />
                        <h4 class="purple">
                            <span>
                                Foreign Assets
                            </span>
                            <span v-if="callAppArgs.assets.length" class="small muted">
                                ({{ callAppArgs.assets.length}})
                            </span>
                        </h4>
                        <ArrayField v-model="callAppArgs.assets" :placeholder="'Add app ID'" />
                        <p class="align-right">
                            <LoadingButton @click="callApp" type="submit" :loading="callAppLoading">Call App
                            </LoadingButton>
                        </p>
                    </div>
                    <!-- </form> -->
                </div>
            </div>
            <div class="right-col">
                <div class="utility fund-app">
                    <h3>Fund App</h3>
                    <p>Current Balance: {{ app.balance ? app.balance / 1000000 : 0 }} ALGO</p>
                    <form @submit.prevent="fundApp">
                        <p v-if="escrowAddress" class="small muted">
                            <span>Escrow address: </span>
                            <span class="purple link" xxclick="browserLink(escrowAddress || '')">
                                {{ utils.shortAddr(escrowAddress) }}
                            </span>
                        </p>
                        <p><input type="number" v-model="fundAppAmt" placeholder="ALGO to send"
                                :disabled="fundAppLoading"></p>
                        <!-- <p class="align-right"><button type="submit">Fund App</button></p> -->
                        <p class="align-right">
                            <LoadingButton type="submit" :loading="fundAppLoading">Fund App</LoadingButton>
                        </p>
                    </form>
                </div>
                <div class="utility algonaut-code">
                    <h3>Algonaut.js Code</h3>
                    <p class="small muted">Click to copy</p>
                    <pre @click="copyAlgoCode" class="code-block">{{ state.sAlgo.algonautJSCode }}</pre>
                </div>
                <AppLogsModule :app-id="app.index" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
// TODO delete this whole file in favor of AppPanel.vue

import { defineComponent } from 'vue'
import state from '../state';
import { sApp } from '../state/modules/sApp';
import * as utils from '../utils';
import { bus } from '../bus';
import { copyText } from 'vue3-clipboard';

// components
import ArrayField from './ArrayField.vue';
import LoadingButton from './LoadingButton.vue';
import UpdateApp from './UpdateApp.vue';
import AppLogsModule from './ContractModules/AppLogsModule.vue';

export default defineComponent({
    components: {
        ArrayField,
        LoadingButton,
        UpdateApp,
        AppLogsModule
    },
    data() {
        return {
            state,
            utils,
            callAppArgs: {
                operationType: 'callApp',
                methodName: '',
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
            deleteAppLoading: false,
        };
    },
    computed: {
        app: function () {
            if (sApp.currentApp && sApp.currentApp.index) {
                return sApp.currentApp;
            }
        },
        escrowAddress: function () {
            if (sApp.currentApp && sApp.currentApp.index) {
                return state.sAlgo.algonaut.getAppEscrowAccount(sApp.currentApp.index);
            }
        }
    },
    methods: {
        async callApp() {
            if (!state.sAlgo.algonaut.account) return state.error('No account connected.');

            if (!sApp.currentApp) {
                return state.error('No current app loaded');
            }

            this.callAppLoading = true;
            state.sAlgo.algonautJSCode = '';

            const convertAppArg = (item: any) => {
                // we need to decide if this is an integer
                item = item.value.toString();

                // if it starts with a 0, treat it like a string (Number() and parseInt() both treat 0101 as an integer, and we lose the initial 0)
                if (item[0] === '0') return item;

                // we use Number() instead of parseInt() for cases like '32px' (parseInt would return `32`)
                if (!isNaN(Number(item))) return Number(item);

                return item;
            };

            const args = this.callAppArgs.operationType === 'callApp' ?
                            [this.callAppArgs.methodName].concat(this.callAppArgs.appArgs.map(convertAppArg)) :
                            this.callAppArgs.appArgs.map(convertAppArg);

            console.log(args);

            const optionalFields = {
                accounts: this.callAppArgs.accounts.map((item: any) => item.value),
                applications: this.callAppArgs.applications.map((item: any) => parseInt(item.value)),
                assets: this.callAppArgs.assets.map((item: any) => parseInt(item.value)),
            }

            const unquotedArgs = JSON.stringify(optionalFields).replace(/"([^"]+)":/g, '$1:');

            state.sAlgo.algonautJSCode =
`const response = await algonaut.${this.callAppArgs.operationType}({
    appIndex: ${sApp.currentApp.index},
    appArgs: ${JSON.stringify(args)},
    optionalFields: ${unquotedArgs}
});`;

            state.log(`Calling app with args: ${JSON.stringify(this.callAppArgs)}`);
            try {
                let res;
                if (this.callAppArgs.operationType === 'callApp') {
                    // res = await state.sAlgo.algonaut.callApp({
                    //     appIndex: sApp.currentApp.index,
                    //     appArgs: args,
                    //     optionalFields: optionalFields
                    // });

                    // defaultTxnFee test (sometime unusual fees are needed to test contract-to-contract calls where sender covers inner txn fee. this will also need to be implemented in deploy app etc)
                    const txn = await state.sAlgo.algonaut.atomicCallApp({
                        appIndex: sApp.currentApp.index,
                        appArgs: args,
                        optionalFields: optionalFields
                    });
                    txn.transaction.fee = state.sAlgo.defaultTxnFee;
                    res = await state.sAlgo.algonaut.sendTransaction(txn);
                } else if (this.callAppArgs.operationType === 'optInApp') {
                    res = await state.sAlgo.algonaut.optInApp({
                        appIndex: sApp.currentApp.index,
                        appArgs: args,
                        optionalFields: optionalFields
                    });
                } else if (this.callAppArgs.operationType === 'closeOutApp') {
                    res = await state.sAlgo.algonaut.closeOutApp({
                        appIndex: sApp.currentApp.index,
                        appArgs: args,
                        optionalFields: optionalFields
                    });
                } else {
                    return state.error('Invalid operation.')
                }

                if (res.status === 'fail') {
                    state.error(res.message);
                } else {
                    state.log(res.message);
                    bus.emit('app-call-completed', parseInt(res.message.substring(res.message.length - 9)));
                }
            } catch (e) {
                console.log(e);
                state.error('Transaction error.');
            }

            this.callAppLoading = false;
        },
        async fundApp() {
            if (!this.escrowAddress || !this.fundAppAmt) return false;
            if (!state.sAlgo.algonaut.account) return state.error('No account connected.');
            if (!sApp.currentApp) return state.error('No app loaded');

            if (this.fundAppAmt < 1000 || window.confirm('Are you sure you want to send this many ALGO?')) {
                this.fundAppLoading = true;
                console.log(this.fundAppAmt);
                state.log(`Sending ${this.fundAppAmt} to ${this.escrowAddress}`);

                try {
                    const res = await state.sAlgo.algonaut.sendAlgo({ to: this.escrowAddress, amount: this.fundAppAmt*1000000 });
                    if (res.status === 'fail') {
                        state.error(res.message);
                    } else {
                        state.log(res.message);
                        this.fundAppAmt = null;
                        sApp.currentApp.balance = await state.sAlgo.algonaut.getAlgoBalance(this.escrowAddress);
                        state.success('Application funded');
                    }
                } catch (e) {
                    console.log(e);
                    state.error('Error funding app.');
                }
                this.fundAppLoading = false;
            }
        },
        async closeOut() {
            if (!state.sAlgo.algonaut.account) return state.error('No account connected.');
            this.closeOutLoading = true;

            this.closeOutLoading = false;

        },
        async deleteApp() {
            if (!state.sAlgo.algonaut.account) return state.error('No account connected.');
            if (!sApp.currentApp) return state.error('No app loaded');
            if (state.sAlgo.activeAccount !== sApp.currentApp.creatorAddress) {
                state.log('The connected account is not the creator of the app, but we will attempt to delete the application anyway.');
            }
            if (window.confirm('Are you sure you want to delete this application? You may only do so if you are the creator.')) {
                this.deleteAppLoading = true;
                try {
                    const res = await state.sAlgo.algonaut.deleteApp(sApp.currentApp.index);
                    if (res.status === 'fail') {
                        state.error(res.message);
                    } else {
                        state.log(res.message);
                    }
                } catch (e) {
                    console.log(e);
                    state.error('Error deleting application. Most likely, you do not have permission to delete it.')
                }
            }
            this.deleteAppLoading = false;
        },
        copyAlgoCode () {
            copyText(state.sAlgo.algonautJSCode, undefined, (error: any, event: any) => {
                if (error) {
                    state.error(error);
                } else {
                    state.log('Copied to clipboard.');
                }
            });
        }
    }
});
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

.contract-header {
    display: flex;

    .contract-info {
        flex: 1 0 70%;

        button {
            margin: 0 5px 0 10px;
        }
    }

    // .contract-actions {
    //     flex: 0 0 30%;
    //     text-align: right;

    //     button {
    //         margin: 10px;
    //     }
    // }
}

.utilities {
    display: flex;
    flex-wrap: wrap;

    .left-col, .right-col {
        flex: 1 1 45%;
        margin: 0 5px;
    }
}

.utility {
    //flex: 0 0 50%;
    border: 2px solid $border;
    padding: 10px;
    margin-bottom: 10px;

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

.code-block {
    background: $bgdark;
    padding: 5px;

    &:hover {
        background-color: lighten($bgdark, 5%);
        cursor: pointer;
    }
}

.link {
    text-decoration: underline;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
}
</style>