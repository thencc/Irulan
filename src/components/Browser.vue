<template>
    <div class="search">
        <form @submit.prevent="search" class="search-form">
            <input type="text" v-model="query" placeholder="Account / App ID / Asset ID">
            <button class="btn-gray">Search</button>
        </form>
    </div>
    <div class="browser">
        <div class="searching" v-if="searching">Searching...</div>
        <div class="results" v-if="response">
            <p class="pink empty align-center" v-if="response.type === 'empty'">{{ response.message }}</p>

            <div class="object" v-if="response.object">
                <h2>{{ response.type }}
                    <span :class="response.type === 'account' ? 'purple' : 'green'">
                        {{ response.type === 'account' ? response.object.address.substring(0, 20) + '...' : response.object.index }}
                    </span>
                </h2>
                <p v-if="response.object.creatorAddress">Creator: <a href="" class="purple" @click.prevent="setSearch(response.object.creatorAddress)">{{ response.object.creatorAddress }}</a></p>
                <button @click="loadApp(response.object.index)" v-if="response.type === 'app'">Load Contract</button>

                <div class="app" v-if="response.type === 'app'">
                    <h3 class="purple">Global State</h3>
                    <table class="browser-table state-table" v-if="response.object.globals && response.object.globals.length">
                        <tr class="browser-table-heading">
                            <th>Key</th>
                            <th>Value</th>
                            <th>Address</th>
                        </tr>
                        <tr v-for="item in response.object.globals" :key="item.key">
                            <td class="key">{{ item.key }}</td>
                            <td>{{ item.value }}</td>
                            <td>{{ item.address }}</td>
                        </tr>
                    </table>
                    <p class="muted" v-if="!response.object.globals || !response.object.globals.length">No global state schema.</p>

                    <h3 class="purple">Local State</h3>
                    <table class="browser-table state-table" v-if="response.object.locals && response.object.locals.length">
                        <tr class="browser-table-heading">
                            <th>Key</th>
                            <th>Value</th>
                            <th>Address</th>
                        </tr>
                        <tr v-for="item in response.object.locals" :key="item.key">
                            <td class="key">{{ item.key }}</td>
                            <td>{{ item.value }}</td>
                            <td>{{ item.address }}</td>
                        </tr>
                    </table>
                    <p class="muted" v-if="!response.object.locals || !response.object.locals.length">No local state schema.</p>
                </div>

                <div class="asset" v-if="response.type === 'asset'">
                    <table class="browser-table">
                        <tr>
                            <td class="key">Name</td>
                            <td>{{ response.object.params.name }}</td>
                        </tr>
                        <tr>
                            <td class="key">Unit Name</td>
                            <td>{{ response.object.params['unit-name'] }}</td>
                        </tr>
                        <tr>
                            <td class="key">Total</td>
                            <td>{{ response.object.params.total }}</td>
                        </tr>
                        <tr>
                            <td class="key">URL</td>
                            <td class="small"><a :href="response.object.params.url" target="_blank">{{ response.object.params.url }}</a></td>
                        </tr>
                        <tr>
                            <td class="key">Frozen</td>
                            <td>{{ response.object.params['default-frozen'] }}</td>
                        </tr>
                        <tr>
                            <td class="key">Decimals</td>
                            <td>{{ response.object.params.decimals }}</td>
                        </tr>
                        <tr>
                            <td class="key">Creator</td>
                            <td><a href="" @click.prevent="setSearch(response.object.params.creator)" class="purple">{{ response.object.params.creator.substring(0, 20) }}...</a></td>
                        </tr>
                        <tr>
                            <td class="key">Manager</td>
                            <td><a href="" @click.prevent="setSearch(response.object.params.manager)" class="purple">{{ response.object.params.manager.substring(0, 20) }}...</a></td>
                        </tr>
                        <tr>
                            <td class="key">Clawback</td>
                            <td><a href="" @click.prevent="setSearch(response.object.params.clawback)" class="purple">{{ response.object.params.clawback.substring(0, 20) }}...</a></td>
                        </tr>
                        <tr>
                            <td class="key">Reserve</td>
                            <td><a href="" @click.prevent="setSearch(response.object.params.reserve)" class="purple">{{ response.object.params.reserve.substring(0, 20) }}...</a></td>
                        </tr>
                    </table>
                </div>

                <div class="account" v-if="response.type === 'account'">
                    <div class="balances">
                        <div class="balance">
                            <p class="balance-caption muted">Balance</p>
                            <p class="balance-amount yellow">{{ (response.object.amount / 1000000).toFixed(4) }} ALGO</p>
                        </div>
                        <div class="balance">
                            <p class="balance-caption muted">Rewards</p>
                            <p class="balance-amount yellow">{{ (response.object.rewards / 1000000).toFixed(4) }} ALGO</p>
                        </div>
                    </div>

                    <h3 class="purple">Assets</h3>
                    <p class="muted" v-if="!response.object.assets || !response.object.assets.length">No assets.</p>
                    <table class="browser-table" v-if="response.object['assets'].length">
                        <tr class="browser-table-heading">
                            <th>Asset ID</th>
                            <th>Amount</th>
                            <th>Frozen?</th>
                            <th>Creator</th>
                        </tr>
                        <tr v-for="asset in response.object.assets" :key="asset['asset-id']">
                            <td class="key">
                                <a href="" @click.prevent="setSearch(asset['asset-id'])" class="yellow">{{ asset['asset-id'] }}</a>
                            </td>
                            <td>{{ asset.amount }}</td>
                            <td>{{ asset['is-frozen'].toString() }}</td>
                            <td><a href="" @click.prevent="setSearch(asset.creator)" class="purple">{{ asset.creator }}</a></td>
                        </tr>
                    </table>

                    <h3 class="purple">Created Assets</h3>
                    <p class="muted" v-if="!response.object['created-assets'] || !response.object['created-assets'].length">No created assets.</p>
                    <table class="browser-table" v-if="response.object['created-assets'].length">
                        <tr class="browser-table-heading">
                            <th>Asset ID</th>
                            <th>Asset Name</th>
                            <th>Unit Name</th>
                            <th>Total</th>
                            <th>URL</th>
                        </tr>
                        <tr v-for="asset in response.object['created-assets']" :key="asset.index">
                            <td class="key">
                                <a href="" @click.prevent="setSearch(asset.index)" class="yellow">{{ asset.index }}</a>
                            </td>
                            <td>{{ asset.params.name }}</td>
                            <td>{{ asset.params['unit-name'] }}</td>
                            <td>{{ asset.params.total }}</td>
                            <td><a :href="asset.params.url" target="_blank">{{ asset.params.url }}</a></td>
                        </tr>
                    </table>

                    <h3 class="purple">Local State</h3>
                    <p class="muted" v-if="!response.object['apps-local-state'] || !response.object['apps-local-state'].length">No local state.</p>

                    <div class="local-state-app" v-for="app in response.object['apps-local-state']" :key="app.id">
                        <h4 class="green">{{ app.id }}</h4>
                        <table class="browser-table" v-if="app['key-value'] && app['key-value'].length">
                            <tr class="browser-table-heading">
                                <th>Key</th>
                                <th>Value</th>
                            </tr>
                            <tr v-for="item in app['key-value']" :key="item.key">
                                <td class="key">{{ decode(item.key) }}</td>
                                <td>
                                    {{ item.value.type === 1 ? decode(item.value.bytes) : item.value.uint }}
                                </td>
                            </tr>
                        </table>
                    </div>

                    <h3 class="purple">Created Apps</h3>
                    <p class="muted" v-if="!response.object['created-apps'] || !response.object['created-apps'].length">No created apps.</p>
                    <table class="browser-table" v-if="response.object['created-apps'].length">
                        <tr class="browser-table-heading">
                            <th>App ID</th>
                            <th></th>
                        </tr>
                        <tr v-for="app in response.object['created-apps']" :key="app.id">
                            <td class="key">{{ app.id }}</td>
                            <td>
                                <button class="btn-link pink" @click="setSearch(app.id)">View in Browser</button>
                                <button @click="loadApp(app.id)">Load Contract</button>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- <h3 class="purple">Full Response</h3>
                <pre class="response">{{ response.object }}</pre> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';
import Modal from './Modal.vue';

export default defineComponent({
    components: {
        Modal
    },
    data() {
        return {
            state,
            response: null as any,
            query: '',
            searching: false
        }
    },
    methods: {
        loadApp(appIndex: number) {
            state.loadApp(appIndex);
        },
        setSearch(query: any) {
            this.query = query;
            this.search();
        },
        decode (s: string) {
            return state.algonaut.fromBase64(s);
        },  
        async search () {
            this.searching = true;
            this.response = null
            var response = {} as any;
            state.log('Searching: "' + this.query + '"...');
            if (state.algonaut.sdk?.isValidAddress(this.query)) {
                state.success('Account found.');
                response = await state.algonaut.getAccountInfo(this.query);
                this.searching = false;
                this.response = {
                    type: 'account',
                    object: response
                }
            } else if (parseInt(this.query)) {
                // attempt to find app
                try {
                    response = await state.algonaut.getAppInfo(parseInt(this.query));
                    state.success('App found.');
                    this.searching = false;
                    this.response = {
                        type: 'app',
                        object: response
                    }
                } catch (e) {
                    try {
                        response = await state.algonaut.getAssetInfo(parseInt(this.query));
                        state.success('Asset found: ' + response.params.name);
                        this.searching = false;
                        this.response = {
                            type: 'asset',
                            object: response
                        }
                    } catch (e) {
                        console.error(e);
                        this.searching = false;
                        this.response = {
                            type: 'empty',
                            message: 'Nothing found.'
                        }
                        state.error(this.response.message);
                    }
                }
            } else {
                this.response = {
                    type: 'empty',
                    message: 'Not a valid resource.'
                };
                state.error(this.response.message);
                this.searching = false;
            }
        }
    },
    computed: {
        globalState: function () {
            if (this.response && this.response.object && this.response.type === 'app') {
                return state.algonaut.stateArrayToObject((this as any).response.object.globals);
            }
        }
    }
});
</script>

<style scoped lang="scss">
@import '../assets/_variables.scss';

$space: 10px;

.searching {
    margin: 0 auto;
    padding-top: 200px;
    text-align: center;
}

.browser {
    flex: 1 1 70%;
    border: 2px solid $border;
    overflow-y: scroll;

    h3 {
        margin-top: 2em;
    }
}

.search {
    border-right: 2px solid $border;
}

.search-form {
    padding: $space;
    display: flex;
    width: 100%;
    input, button {
        height: 35px;
        margin: 0;
    }

    input {
        flex: 1 1 90%;
        padding: 5px 10px;
    }

    button {
        flex: 1 1 100px;
    }
}

.response {
    margin: $space;
    padding: 10px;
    background-color: $bgdark;
}

.object {
    margin: $space;
    h2 {
        text-transform: capitalize;
    }
}

.browser-table {
    background-color: $bgdark;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    tr.browser-table-heading {
        background-color: $bg;

        th {
            padding: 10px;
            font-weight: normal;
            color: $textlight;
        }
    }


    tr {
        border: none;
        padding: 0;
        margin: 0;
        border-collapse: collapse;
        border-bottom: 1px solid $bg;
    }

    td {
        border: none;
        margin: 0;
        padding: 10px;

        &.key {
            color: $yellow;
        }
    }
}
</style>