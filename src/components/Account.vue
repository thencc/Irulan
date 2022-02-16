<template>
    <button class="btn-purple" @click="showModal = true">
        {{ state.activeAccount ? accountDisplay : 'Connect Account' }}
    </button>
    <Modal :show="showModal" @close="close">
        <h3 class="modal-title">Connect Account</h3>
        <div class="modal-content">
            <div class="account-options" v-if="page === 'options'">
                <div v-if="state.activeAccount">
                    <p class="green">You are already connected to an account (click to copy):</p>
                    <p class="purple copy-account" @click="copyAccount">{{ state.activeAccount.substring(0, 20) }}...</p>
                    <p class="muted">You can connect with a different account by choosing an option below.</p>
                    <button v-if="state.signingMode === 'wc'" class="danger" @click="wcLogout">Disconnect WalletConnect</button>
                </div>
                <p class="align-center">Choose your fighter:</p>
                <button @click="wcLogin">Connect to Algorand Wallet</button>
                <button @click="page = 'recover'">Recover from mnemonic</button>
                <button @click="createNew">Create new account</button>
            </div>

            <div class="recover-account" v-if="page === 'recover'">
                <p><a class="modal-back small" @click="page = 'options'">&larr; back</a></p>
                <form @submit.prevent="recoverAccount(recoveryPhrase)">
                    <input type="text" v-model="recoveryPhrase" placeholder="Type mnemonic here to recover account.">
                    <button type="submit">Connect</button>
                </form>
            </div>

            <div class="new-account" v-if="page === 'new-account'">
                <p class="green">Account created:</p>
                <p class="purple">{{ newAccount.address }}</p>
                <p class="mnemonic">{{ newAccount.mnemonic }}</p>
                <p>Write down this mnemonic if you intend to use this account for more than temporary tests.</p>
                <p>If you are on TestNet, you can <a href="https://bank.testnet.algorand.network/" target="_blank">fund this account with ALGO at the dispenser</a>.</p>
                <p class="align-center"><button @click="recoverAccount(newAccount.mnemonic)" class="btn-purple">Use Irulan with this account</button></p>
            </div>
        </div>
        <p class="pink" v-if="error">{{ error }}</p>
    </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';
import Modal from './Modal.vue';
import { copyText } from 'vue3-clipboard';

export default defineComponent({
    components: {
        Modal
    },
    data() {
        return {
            state,
            showModal: false,
            error: '',
            page: 'options',
            recoveryPhrase: '',
            newAccount: {} as { address: string, mnemonic: string },
        }
    },
    mounted() {
        const wcData = localStorage.getItem('walletconnect');
        if (wcData) {
            const parseData = JSON.parse(wcData ? wcData.toString() : '');
            if (parseData.connected) {
                console.log('WC data found.');
                //state.algonaut.setWalletConnectAccount(parseData.accounts[0]);
                state.signingMode = 'wc';
                state.activeAccount = parseData.accounts[0];
                //this.wcLogin();
            } else {
                console.log('No WC data');
            }
        } 
    },
    computed: {
        accountDisplay () {
            if (state.activeAccount && state.activeAccount.length) {
                return state.activeAccount.toString().substring(0, 20) + '...';
            }
        }
    },
    methods: {
        createNew () {
            this.error = '';
            const acct = state.algonaut.createWallet();
            state.log('Created new account: ' + acct.address);
            this.newAccount = acct;
            this.page = 'new-account';
        },
        recoverAccount (mnemonic: string) {
            this.error = '';
            const acct = state.algonaut.recoverAccount(mnemonic);
            if (acct) {
                console.log(acct);
                state.algonaut.setAccount(acct as any);
                state.activeAccount = (acct as any).addr;
                state.signingMode = 'sk';
                state.success('Connected to account: ' + state.activeAccount);
                this.close();
            } else {
                this.error = 'Not a valid account.'
            }
        },
        close() {
            this.page = 'options';
            this.showModal = false;
        },
        async wcLogin() {
            await state.algonaut.connectAlgoWallet({
                onConnect: this.onConnect,
                onDisconnect: this.onDisconnect,
                onSessionUpdate: this.onSessionUpdate
            } as any)
        },
        async wcLogout() {
            localStorage.removeItem('walletconnect');
            state.activeAccount = '';
            state.algonaut.account = undefined;
        },  
        onConnect(payload: any) {
            const { accounts } = payload.params[0];
            state.signingMode = 'wc';
            state.activeAccount = accounts[0];
            state.algonaut.setWalletConnectAccount(accounts[0]);
            state.success('Connected to account: ' + state.activeAccount);
            this.close();
        },
        onDisconnect() {
            state.activeAccount = null;
            state.error('Disconnected from account.');
        },  
        onSessionUpdate(accounts: any) {
            state.signingMode = 'wc';
            state.activeAccount = accounts[0];
            state.algonaut.setWalletConnectAccount(accounts[0]);
            state.success('Connected to account: ' + state.activeAccount);
        },
        copyAccount () {
            copyText(state.activeAccount, undefined, (error: any, event: any) => {
                if (error) {
                    state.error(error);
                } else {
                    state.log('Copied account to clipboard.');
                }
            });
        }
    }
})
</script>

<style scoped lang="scss">
@import '../assets/variables';

.account-options button {
    display: block;
    width: 50%;
    margin: 5px auto;
}

.mnemonic {
    background: $bgdark;
    color: $textlight;
    padding: 10px;
    font-size: 85%;
}

.recover-account form {
    display: flex;

    input,button {
        height: 40px;
        margin: 0;
    }

    input {
        flex: 1 1 60%;
    }

    button {
        flex: 1 1 150px;
    }
}

.copy-account {
    cursor: pointer;
}
</style>