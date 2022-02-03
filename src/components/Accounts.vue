<template>
    <section class="module accounts">
        <h2>Account Information</h2>
        <form @submit.prevent="getInfo()">
            <div class="form-field account-info">
                <input type="text" id="wallet" name="wallet" v-model="address" placeholder="Paste address here">
                <button type="submit">Get Info</button>
            </div>
        </form>
        <div class="module-content" v-if="acct">
            <AlgoLink type="address" :address="acct.address">View account on AlgoExplorer</AlgoLink>
            <table>
                <tr v-if="acct">
                    <td>Balance</td>
                    <td>{{ acct.amount / 1000000 }} ALGO</td>
                </tr>
                <tr v-if="acct">
                    <td>Rewards</td>
                    <td>{{ acct.rewards / 1000000 }} ALGO</td>
                </tr>
                <tr v-if="acct && acct['pending-rewards']">
                    <td>Pending Rewards</td>
                    <td>{{ acct['pending-rewards'] / 1000000 }} ALGO</td>
                </tr>
                <tr v-if="acct && acct['assets']">
                    <td>Assets</td>
                    <td>{{ acct['assets'].length }}</td>
                </tr>
                <tr v-if="acct && acct['created-apps']">
                    <td>Created Apps</td>
                    <td>{{ acct['created-apps'].length }}</td>
                </tr>
                <tr v-if="acct && acct['created-assets']">
                    <td>Created Assets</td>
                    <td>{{ acct['created-assets'].length }}</td>
                </tr>
            </table>

            <div class="owned-assets" v-if="acct && acct['assets'] && acct['assets'].length">
                <h4 class="form-label">Assets ({{ acct['assets'].length }})</h4>
                <table>
                    <tr>
                        <th>Index</th>
                        <th>Amount</th>
                        <th></th>
                        <th></th>
                    </tr>
                    <tr v-for="asset in acct['assets']" :key="asset['asset-id']" class="asset-table">
                        <td>{{ asset['asset-id'] }}</td>
                        <td>{{ asset.amount }}</td>
                        <td>Load ASA</td>
                        <td><AlgoLink type="asset" :address="asset['asset-id'].toString()">AlgoExplorer</AlgoLink></td>
                    </tr>
                </table>
            </div>

            <div class="owned-apps" v-if="acct && acct['created-apps'] && acct['created-apps'].length">
                <h4 class="form-label">Created Apps ({{ acct['created-apps'].length }})</h4>
                <table>
                    <tr v-for="app in acct['created-apps']" :key="app.id" class="app-table">
                        <td>App Index {{ app.id }}</td>
                        <td>Load Contract</td>
                        <td><AlgoLink type="application" :address="app.id.toString()">AlgoExplorer</AlgoLink></td>
                    </tr>
                    <!-- <tr>
                        <th>Global State</th>
                    </tr>
                    <tr v-for="item in app['params']['global-state']" :key="item.key">
                        <td>{{ item.key }}</td>
                        <td>{{ item.value.type === 1 ? item.value.bytes : item.value.uint }}</td>
                    </tr> -->
                </table>
            </div>

             <div class="created-assets" v-if="acct && acct['created-assets'] && acct['created-assets'].length">
                <h4 class="form-label">Created Assets ({{ acct['created-assets'].length }})</h4>
                <table>
                    <tr v-for="asset in acct['created-assets']" :key="asset.id" class="asset-table">
                        <td>Asset Index {{ asset.id }}</td>
                        <td>Load ASA</td>
                        <td><AlgoLink type="asset" :address="asset.id.toString()">AlgoExplorer</AlgoLink></td>
                    </tr>
                </table>
            </div>
        </div>
    </section>
</template>

<script>
import { defineComponent } from 'vue' 
import state from '../state';
import AlgoLink from './AlgoLink.vue';

export default defineComponent({
    components: {
        AlgoLink
    },
    data() {
        return { 
             address: '',
             loading: false,
             acct: null,
             state
        }
    },
    methods: {
        async getInfo() {
            this.loading = true;
            state.log('Getting account info...');
            try {
                this.acct = await state.algonaut.getAccountInfo(this.address);
                console.log(this.acct);
                state.success('Account fetched: ' + this.acct.address);
            } catch (e) {
                console.log(e);
                state.error('Error getting account info.')
            }
        }
    }
})
</script>

<style scoped lang="scss">
.module.accounts {

}

.module.accounts h2 {
    border-bottom: none;
}

.account-info {
    display: flex;
    width: 100%;

    button { 
        font-size: 0.7em;
    }

    input {
        flex: 1 1 80%;
    }

    button {
        flex: 1 1 80px;
    }
}

h4 {
    font-size: 1.2em;
    margin-bottom: 2px;
}

.account-info-section {
    margin-bottom: 15px;
}

.app-table {
    margin-bottom: 20px;
}
</style>