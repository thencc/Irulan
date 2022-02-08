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
                <p v-if="response.object.creatorAddress">Creator: <span class="purple">{{ response.object.creatorAddress }}</span></p>
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

                <h3 class="purple">Full Response</h3>
                <pre class="response">{{ response.object }}</pre>
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
                return state.algonaut.stateArrayToObject(this.response.object.globals);
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