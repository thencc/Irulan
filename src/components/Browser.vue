<template>
    <div class="search">
        <form @submit.prevent="" class="search-form">
            <input v-model="searchQueryInputVal" type="search" placeholder="Account/App/Asset ID (&#8984;+K)"
                ref="searchInput">
            <button class="btn-gray" title="&#8984; K">Search</button>
        </form>
    </div>
    <div class="browser">
        <div class="searching" v-if="state.sSearch.loading">Searching...</div>

        <div class="results" v-if="searchRes">
            <p class="pink empty align-center" v-if="searchRes.type === 'empty'">
                {{ searchRes.message }}
            </p>

            <div class="object" v-else-if="searchRes && searchRes.object">
                <h2>{{ searchRes.type }}
                    <span :class="searchRes.type === 'account' ? 'purple' : 'green'">
                        {{ searchRes.type === 'account'
                        ? utils.shortAddr(searchRes.object.address)
                        : searchRes.object.index
                        }}
                    </span>
                </h2>
                <p v-if="searchRes.object.creatorAddress">
                    Creator:
                    <router-link :to="state.sSearch.getSearchPath(searchRes.object.creatorAddress)"
                        v-slot="{ route, href }">
                        <a :href="href" class="purple">
                            {{ utils.shortAddr(searchRes.object.creatorAddress) }}
                        </a>
                    </router-link>
                </p>

                <router-link v-if="searchRes.type === 'app'" :to="getDashAppPath(searchRes.object.index)"
                    v-slot="{ route }">
                    <button>Load Contract</button>
                </router-link>

                <div class="app" v-if="searchRes.type === 'app'">
                    <h3 class="purple">Global State</h3>
                    <table class="browser-table state-table"
                        v-if="searchRes.object.globals && searchRes.object.globals.length">
                        <tr class="browser-table-heading">
                            <th>Key</th>
                            <th>Value</th>
                            <th>Address</th>
                        </tr>
                        <tr v-for="item in searchRes.object.globals" :key="item.key">
                            <td class="key">{{ item.key }}</td>
                            <td>{{ item.value }}</td>
                            <td>{{ item.address }}</td>
                        </tr>
                    </table>
                    <p class="muted" v-if="!searchRes.object.globals || !searchRes.object.globals.length">No global
                        state
                        schema.</p>

                    <h3 class="purple">Local State</h3>
                    <table class="browser-table state-table"
                        v-if="searchRes.object.locals && searchRes.object.locals.length">
                        <tr class="browser-table-heading">
                            <th>Key</th>
                            <th>Value</th>
                            <th>Address</th>
                        </tr>
                        <tr v-for="item in searchRes.object.locals" :key="item.key">
                            <td class="key">{{ item.key }}</td>
                            <td>{{ item.value }}</td>
                            <td>{{ item.address }}</td>
                        </tr>
                    </table>
                    <p class="muted" v-if="!searchRes.object.locals || !searchRes.object.locals.length">No local state
                        schema.</p>
                </div>

                <div class="asset" v-if="searchRes.type === 'asset'">
                    <table class="browser-table">
                        <tr>
                            <td class="key">Name</td>
                            <td>{{ searchRes.object.params.name }}</td>
                        </tr>
                        <tr>
                            <td class="key">Unit Name</td>
                            <td>{{ searchRes.object.params['unit-name'] }}</td>
                        </tr>
                        <tr>
                            <td class="key">Total</td>
                            <td>{{ searchRes.object.params.total }}</td>
                        </tr>
                        <tr>
                            <td class="key">URL</td>
                            <td class="small"><a :href="searchRes.object.params.url" target="_blank">{{
                                    searchRes.object.params.url }}</a></td>
                        </tr>
                        <tr>
                            <td class="key">Frozen</td>
                            <td>{{ searchRes.object.params['default-frozen'] }}</td>
                        </tr>
                        <tr>
                            <td class="key">Decimals</td>
                            <td>{{ searchRes.object.params.decimals }}</td>
                        </tr>
                        <tr>
                            <td class="key">Creator</td>
                            <td>
                                <router-link :to="state.sSearch.getSearchPath(searchRes.object.params.creator)"
                                    v-slot="{ route, href }">
                                    <a :href="href" class="long-cell purple">
                                        {{ searchRes.object.params.creator }}
                                    </a>
                                </router-link>
                            </td>
                        </tr>
                        <tr>
                            <td class="key">Manager</td>
                            <td>
                                <router-link :to="state.sSearch.getSearchPath(searchRes.object.params.manager)"
                                    v-slot="{ route, href }">
                                    <a :href="href" class="long-cell purple">
                                        {{ searchRes.object.params.manager }}
                                    </a>
                                </router-link>
                            </td>
                        </tr>
                        <tr>
                            <td class="key">Clawback</td>
                            <td>
                                <router-link :to="state.sSearch.getSearchPath(searchRes.object.params.clawback)"
                                    v-slot="{ route, href }">
                                    <a :href="href" class="long-cell purple">
                                        {{ searchRes.object.params.clawback }}
                                    </a>
                                </router-link>
                            </td>
                        </tr>
                        <tr>
                            <td class="key">Reserve</td>
                            <td>
                                <router-link :to="state.sSearch.getSearchPath(searchRes.object.params.reserve)"
                                    v-slot="{ route, href }">
                                    <a :href="href" class="long-cell purple">
                                        {{ searchRes.object.params.reserve }}
                                    </a>
                                </router-link>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="account" v-if="searchRes.type === 'account'">
                    <div class="balances">
                        <div class="balance">
                            <p class="balance-caption muted">Balance</p>
                            <p class="balance-amount yellow">{{ (searchRes.object.amount / 1000000).toFixed(4) }} ALGO
                            </p>
                        </div>
                        <div class="balance">
                            <p class="balance-caption muted">Rewards</p>
                            <p class="balance-amount yellow">{{ (searchRes.object.rewards / 1000000).toFixed(4) }} ALGO
                            </p>
                        </div>
                    </div>

                    <h3 class="purple">Assets</h3>
                    <p class="muted" v-if="!searchRes.object.assets || !searchRes.object.assets.length">No assets.</p>
                    <table class="browser-table" v-if="searchRes.object['assets'].length">
                        <tr class="browser-table-heading">
                            <th>Asset ID</th>
                            <th>Amount</th>
                            <th>Frozen?</th>
                            <th>Creator</th>
                        </tr>
                        <tr v-for="asset in searchRes.object.assets" :key="asset['asset-id']">
                            <td class="key">
                                <router-link :to="state.sSearch.getSearchPath(asset['asset-id'])"
                                    v-slot="{ route, href }">
                                    <a :href="href" class="yellow">
                                        {{ asset['asset-id'] }}
                                    </a>
                                </router-link>
                            </td>
                            <td>{{ asset.amount }}</td>
                            <td>{{ asset['is-frozen'].toString() }}</td>
                            <td v-if="asset.creator">
                                <router-link :to="state.sSearch.getSearchPath(asset.creator)" v-slot="{ route, href }">
                                    <a :href="href" class="purple">
                                        {{ utils.shortAddr(asset.creator) }}
                                    </a>
                                </router-link>
                            </td>
                        </tr>
                    </table>

                    <h3 class="purple">Created Assets</h3>
                    <p class="muted"
                        v-if="!searchRes.object['created-assets'] || !searchRes.object['created-assets'].length">No
                        created assets.</p>
                    <table class="browser-table" v-if="searchRes.object['created-assets'].length">
                        <tr class="browser-table-heading">
                            <th>Asset ID</th>
                            <th>Asset Name</th>
                            <th>Unit Name</th>
                            <th>Total</th>
                            <th>URL</th>
                        </tr>
                        <tr v-for="asset in searchRes.object['created-assets']" :key="asset.index">
                            <td class="key">
                                <router-link :to="state.sSearch.getSearchPath(asset.index)" v-slot="{ href }">
                                    <a :href="href" class="yellow">
                                        {{ asset.index }}
                                    </a>
                                </router-link>
                            </td>
                            <td>{{ asset.params.name }}</td>
                            <td>{{ asset.params['unit-name'] }}</td>
                            <td>{{ asset.params.total }}</td>
                            <td><a :href="asset.params.url" target="_blank">{{ asset.params.url }}</a></td>
                        </tr>
                    </table>

                    <h3 class="purple">Local State</h3>
                    <p class="muted"
                        v-if="!searchRes.object['apps-local-state'] || !searchRes.object['apps-local-state'].length">No
                        local state.</p>

                    <div class="local-state-app" v-for="app in searchRes.object['apps-local-state']" :key="app.id">
                        <h4>
                            App
                            <router-link :to="state.sSearch.getSearchPath(app.id)" v-slot="{ href }">
                                <a :href="href" class="green">
                                    {{ app.id }}
                                </a>
                            </router-link>
                        </h4>
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
                    <p class="muted"
                        v-if="!searchRes.object['created-apps'] || !searchRes.object['created-apps'].length">
                        No created apps.</p>
                    <table class="browser-table" v-if="searchRes.object['created-apps'].length">
                        <tr class="browser-table-heading">
                            <th>App ID</th>
                            <th></th>
                        </tr>
                        <tr v-for="app in searchRes.object['created-apps']" :key="app.id">
                            <td class="key">
                                <router-link :to="state.sSearch.getSearchPath(app.id)" v-slot="{ href }">
                                    <a :href="href" class="green">
                                        {{ app.id }}
                                    </a>
                                </router-link>
                            </td>
                            <td>
                                <router-link :to="getDashAppPath(app.id)">
                                    <button>Load Contract</button>
                                </router-link>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useKeypress } from 'vue3-keypress';

import * as utils from '../utils';
import router from '../router';

// states
import state from '../state';

export default defineComponent({
    data() {
        return {
            state,
            utils,

            searchQueryInputVal: '',
            queryTimer: 0 as number | NodeJS.Timeout
        }
    },
    computed: {
        searchRes: () => state.sSearch.response
    },
    setup(props, ctx) {
        const searchInput = ref<HTMLInputElement>();

        // focus search input with meta+K key cmd
        useKeypress({
            keyEvent: 'keydown',
            keyBinds: [
                {
                    keyCode: 75, // K. keycode as int (https://github.com/lupas/vue3-keypress#key-binds)
                    modifiers: ['metaKey'],
                    success: () => {
                        // console.log('meta+K pressed');
                        searchInput.value?.focus();
                        searchInput.value?.select();
                    }
                }
            ]
        });

        return { searchInput }; // expose
    },
    created () {
        watch(
            () => state.sSearch.query,
            (q) => {
                this.searchQueryInputVal = q;
            },
            { immediate: true }
        )
    },
    watch: {
        searchQueryInputVal: {
            handler(queryNew, queryOld) {
                // console.log('queryNew', queryNew);

                // if it wasnt set programmatically like from clicking a link, then debounce typed search for less req/s
                if (queryNew !== state.sSearch.query) {
                    clearTimeout(this.queryTimer);

                    this.queryTimer = setTimeout(() => {
                        // console.log('timeouted');
                        state.sSearch.query = queryNew;
                        // this.checkingUsername = false;
                    }, 1000);
                } else {
                    // console.log('dont queryNew debounce');
                }
            }
        }
    },
    methods: {
        getDashAppPath(appId: number) {
            let r = router.nonDestructiveResolve({
                name: 'DashApp',
                params: {
                    appId: appId.toString()
                }
            });
            return r.fullPath;
        },
        decode (s: string) {
            return state.sAlgo.algonaut.fromBase64(s);
        },
    },
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
    overflow-x: scroll;
    // max-width: 420px;

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
    input::-webkit-search-cancel-button {
        -webkit-appearance: none;
        height: 18px;
        width: 18px;
        border-radius: 50%;
        cursor: pointer;

        background-color: rgba(255, 255, 255, 0.5);
        -webkit-mask-image: url(https://fonts.gstatic.com/s/i/materialicons/cancel/v16/24px.svg);
        mask-image: url(https://fonts.gstatic.com/s/i/materialicons/cancel/v16/24px.svg);
        -webkit-mask-size: contain;
        mask-size: contain;
    }
    input::-webkit-search-cancel-button:hover {
        background-color: rgba(255, 255, 255, 0.75);
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
    // max-width: 460px;
    // overflow-x: scroll;
    // display: block; /* enables width sizing */

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

        a.long-cell {
            display: block;
            max-width: 260px;
            overflow-x: scroll;
            padding-right: 10px;
            margin-right: -48px;
            mask-image: linear-gradient(
                to left,
                rgba(0, 0, 0, 0) 0px,
                black 10px
            );
            -webkit-mask-image: linear-gradient(
                to left,
                rgba(0, 0, 0, 0) 0px,
                black 10px
            );
        }
    }

}
</style>