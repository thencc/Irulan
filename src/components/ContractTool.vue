<template>
<div class="contract-tool" v-if="app">
    <div class="contract-header">
        <div class="contract-info">
            <h2>App <span class="green link" @click="browserLink(app.index)">{{ app.index }}</span></h2>
            <p class="metadata">
                <span class="creator">
                    <span class="muted">Creator:</span> <span class="purple link" @click="browserLink(app.creatorAddress)">{{ app.creatorAddress }}</span>
                </span>
            </p>
        </div>
        <div class="contract-actions">
            <UpdateApp :app="app" />
            <LoadingButton @click="deleteApp" class="btn-danger" :loading="deleteAppLoading">Delete App</LoadingButton>
        </div>
    </div>
    <div class="utilities">
        <div class="left-col">
            <div class="utility call-app">
                <h3>App Operations</h3>
                <!-- <form @submit.prevent="callApp"> -->
                <div>
                    Transaction type:
                    <select name="operationType" id="operationType" v-model="callAppArgs.operationType">
                        <option value="callApp">Call App</option>
                        <option value="optInApp">Opt-In App</option>
                        <option value="closeOutApp">Close Out App</option>
                    </select>
                    <div class="method-name" v-if="callAppArgs.operationType === 'callApp'">
                        <p><input type="text" v-model="callAppArgs.methodName" placeholder="Method name"></p>
                        <p class="small muted">(method name gets prepended to arguments array)</p>
                    </div>
                    <h4 class="purple">Arguments</h4>
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
        </div>
        <div class="right-col">
            <div class="utility fund-app">
                <h3>Fund App</h3>
                <p>Current Balance: {{ app.balance ? app.balance / 1000000 : 0 }} ALGO</p>
                <form @submit.prevent="fundApp">
                    <p class="small muted">Escrow address: <span class="purple link" @click="browserLink(escrowAddress || '')">{{ escrowAddress }}</span></p>
                    <p><input type="number" v-model="fundAppAmt" placeholder="ALGO to send" :disabled="fundAppLoading"></p>
                    <!-- <p class="align-right"><button type="submit">Fund App</button></p> -->
                    <p class="align-right"><LoadingButton type="submit" :loading="fundAppLoading">Fund App</LoadingButton></p>
                </form>
            </div>
            <div class="utility algonaut-code">
                <h3>Algonaut.js Code</h3>
                <p class="small muted">Click to copy</p>
                <pre @click="copyAlgoCode" class="code-block">{{ state.algonautJSCode }}</pre>
            </div>
        </div>
    </div>
</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';
import ArrayField from './ArrayField.vue';
import LoadingButton from './LoadingButton.vue';
import { copyText } from 'vue3-clipboard';
import UpdateApp from './UpdateApp.vue';

export default defineComponent({
    data() {
        return {
            state,
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
            if (!state.algonaut.account) return state.error('No account connected.');
            this.callAppLoading = true;
            state.algonautJSCode = '';

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

            state.algonautJSCode = 
`const response = await algonaut.${this.callAppArgs.operationType}(
    ${state.currentApp.index},
    ${JSON.stringify(args)},
    ${unquotedArgs}
);`;            
            
            state.log(`Calling app with args: ${JSON.stringify(this.callAppArgs)}`);
            try {
                let res;
                if (this.callAppArgs.operationType === 'callApp') {
                    res = await state.algonaut.callApp({ 
                        appIndex: state.currentApp.index, 
                        appArgs: args, 
                        optionalFields: optionalFields
                    });
                } else if (this.callAppArgs.operationType === 'optInApp') {
                    res = await state.algonaut.optInApp({ 
                        appIndex: state.currentApp.index, 
                        appArgs: args, 
                        optionalFields: optionalFields
                    });
                } else if (this.callAppArgs.operationType === 'closeOutApp') {
                    res = await state.algonaut.closeOutApp({ 
                        appIndex: state.currentApp.index, 
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
                }
            } catch (e) {
                console.log(e);
                state.error('Transaction error.');
            }

            this.callAppLoading = false;
        },
        async fundApp() {
            if (!this.escrowAddress || !this.fundAppAmt) return false;
            if (!state.algonaut.account) return state.error('No account connected.');
            
            if (this.fundAppAmt < 1000 || window.confirm('Are you sure you want to send this many ALGO?')) {
                this.fundAppLoading = true;
                console.log(this.fundAppAmt);
                state.log(`Sending ${this.fundAppAmt} to ${this.escrowAddress}`);

                try {
                    const res = await state.algonaut.sendAlgo({ to: this.escrowAddress, amount: this.fundAppAmt*1000000 });
                    if (res.status === 'fail') {
                        state.error(res.message);
                    } else {
                        state.log(res.message);
                        this.fundAppAmt = null;
                        this.app.balance = await state.algonaut.getAlgoBalance(this.escrowAddress);
                        state.success('Application funded');
                    }
                } catch (e) {
                    console.log(e);
                    state.error('Error funding app.');
                }
                this.fundAppLoading = false;
            }
        },
        async browserLink(query: string) {
            this.$router.push(state.getNewRoute(this.$route, { contractId: state.currentApp.index.toString(), query }));
        },
        async closeOut() {
            if (!state.algonaut.account) return state.error('No account connected.');
            this.closeOutLoading = true;
            
            this.closeOutLoading = false;

        },
        async deleteApp() {
            if (!state.algonaut.account) return state.error('No account connected.');
            if (state.activeAccount !== this.app.creatorAddress) {
                state.log('The connected account is not the creator of the app, but we will attempt to delete the application anyway.');
            }
            if (window.confirm('Are you sure you want to delete this application? You may only do so if you are the creator.')) {
                this.deleteAppLoading = true;
                try {
                    const res = await state.algonaut.deleteApplication(state.currentApp.index);
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
            copyText(state.algonautJSCode, undefined, (error: any, event: any) => {
                if (error) {
                    state.error(error);
                } else {
                    state.log('Copied to clipboard.');
                }
            });
        }
    },
    components: { ArrayField, LoadingButton, UpdateApp }
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

.contract-header {
    display: flex;

    .contract-info {
        flex: 1 0 70%;
    }
    
    .contract-actions {
        flex: 0 0 30%;
        text-align: right;

        button {
            margin: 10px;
        }
    }
}

.utilities {
    display: flex;
    flex-wrap: wrap;

    .left-col, .right-col {
        flex: 1 1 45%;
        margin: 5px;
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