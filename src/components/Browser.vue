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
                <button @click="loadApp(response.object.index)" v-if="response.type === 'app'">Load Contract</button>
            </div>

            <pre class="response">{{ response }}</pre>
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
</style>