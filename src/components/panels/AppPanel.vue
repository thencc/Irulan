<template>
	<div class="contract-tool" v-if="app">
		<div class="contract-header">
			<div class="contract-info">
				<div style="display: flex; align-items: center;">
					<h2>
						<span>
							App
						</span>
						<!-- keeps browser url preview + doesnt reload page w a.href -->
						<router-link class="green link" :to="browserLink(app.index)">
							{{ app.index }}
						</router-link>
					</h2>
					<div style="flex-grow: 1"></div>
					<!-- <UpdateApp :app="app" /> -->
					<!-- <LoadingButton @click="deleteApp" class="btn-danger" :loading="deleteAppLoading">
						Delete App
					</LoadingButton> -->
				</div>

				<p class="metadata">
					<span class="creator">
						<span class="muted">Creator: </span>
						<span class="purple link" @click="browserLink(app.creatorAddress)">
							{{ utils.shortAddr(app.creatorAddress) }}
						</span>
					</span>
				</p>
			</div>
		</div>
		<!-- <div class="utilities">
			<div class="left-col">
				<div class="utility call-app">
					<h3>App Operations</h3>
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
								({{ callAppArgs.appArgs.length }})
							</span>
						</h4>
						<ArrayField v-model="callAppArgs.appArgs" :placeholder="'Add argument'" />
						<h4 class="purple">
							<span>
								Accounts
							</span>
							<span v-if="callAppArgs.accounts.length" class="small muted">
								({{ callAppArgs.accounts.length }})
							</span>
						</h4>
						<ArrayField v-model="callAppArgs.accounts" :placeholder="'Add account'" />
						<h4 class="purple">
							<span>
								Foreign Applications
							</span>
							<span v-if="callAppArgs.applications.length" class="small muted">
								({{ callAppArgs.applications.length }})
							</span>
						</h4>
						<ArrayField v-model="callAppArgs.applications" :placeholder="'Add app ID'" />
						<h4 class="purple">
							<span>
								Foreign Assets
							</span>
							<span v-if="callAppArgs.assets.length" class="small muted">
								({{ callAppArgs.assets.length }})
							</span>
						</h4>
						<ArrayField v-model="callAppArgs.assets" :placeholder="'Add app ID'" />
						<p class="align-right">
							<LoadingButton @click="callApp" type="submit" :loading="callAppLoading">Call App
							</LoadingButton>
						</p>
					</div>
				</div>
			</div>
			<div class="right-col">
				<div class="utility fund-app">
					<h3>Fund App</h3>
					<p>Current Balance: {{ app.balance ? app.balance / 1000000 : 0 }} ALGO</p>
					<form @submit.prevent="fundApp">
						<p v-if="escrowAddress" class="small muted">
							<span>Escrow address: </span>
							<span class="purple link" @click="browserLink(escrowAddress || '')">
								{{ utils.shortAddr(escrowAddress) }}
							</span>
						</p>
						<p><input type="number" v-model="fundAppAmt" placeholder="ALGO to send"
								:disabled="fundAppLoading"></p>
						<p class="align-right">
							<LoadingButton type="submit" :loading="fundAppLoading">Fund App</LoadingButton>
						</p>
					</form>
				</div>
				<div class="utility algonaut-code">
					<h3>Algonaut.js Code</h3>
					<p class="small muted">Click to copy</p>
					<pre @click="copyAlgoCode" class="code-block">{{ state.algonautJSCode }}</pre>
				</div>
				<AppLogsModule :app-id="app.index" />
			</div>
		</div> -->
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as utils from '../../utils';
import state from '../../state';
import { sApp } from '../../state/modules/sApp';
import router from '../../router';

export default defineComponent({
	components: {
	},
	data() {
		return {
			state,
			utils
		}
	},
	computed: {
		app: function () {
			return sApp.currentApp;

			// also works IF import(router).then approach used
			// if (sApp.currentApp && sApp.currentApp.index) {
			// 	return sApp.currentApp;
			// }

			// works
			// if (state.currentApp && state.currentApp.index) {
			// 	return state.currentApp;
			// }
		},
	},
	setup() {
	},
	mounted() {
	},
	methods: {
		browserLink(query: string) {
			let r = router.nonDestructiveResolve({
				query: {
					s: query
				}
			});
			return r.fullPath;
		},
	}
});
</script>

<style lang="scss" scoped>
@import '../../assets/variables';
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