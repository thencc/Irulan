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
						<router-link class="green link" :to="state.sSearch.getSearchPath(app.index)">
							{{ app.index }}
						</router-link>
					</h2>
					<div style="flex-grow: 1"></div>
					<UpdateApp :app="app" />
					<LoadingButton @click="deleteApp" class="btn-danger" :loading="deleteAppLoading">
						Delete App
					</LoadingButton>
				</div>

				<p class="metadata">
					<span class="creator">
						<span class="muted">Creator: </span>
						<router-link class="purple link" :to="state.sSearch.getSearchPath(app.creatorAddress)">
							{{ utils.shortAddr(app.creatorAddress) }}
						</router-link>
					</span>
				</p>
			</div>
		</div>
		<div class="utilities">
			<div class="left-col">
				<AppOperationsModule />
			</div>
			<div class="right-col">
				<FundAppModule />
				<CopyAlgoCodeModule />
				<AppLogsModule :app-id="app.index" />
			</div>
		</div>
	</div>
	<div v-else-if="sApp.loading" style="padding: 20px">
		loading app...
	</div>
	<div v-else style="padding: 20px">
		app not found ):
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as utils from '../../utils';
import state from '../../state';
import { sApp } from '../../state/modules/sApp';
import router from '../../router';

// components
import ArrayField from '../ArrayField.vue';
import LoadingButton from '../LoadingButton.vue';
import UpdateApp from '../UpdateApp.vue';
import FundAppModule from '../ContractModules/FundAppModule.vue';
import AppLogsModule from '../ContractModules/AppLogsModule.vue';
import CopyAlgoCodeModule from '../ContractModules/CopyAlgoCodeModule.vue';
import AppOperationsModule from '../ContractModules/AppOperationsModule.vue';

export default defineComponent({
	components: {
    ArrayField,
    LoadingButton,
    UpdateApp,
    FundAppModule,
    AppLogsModule,
    CopyAlgoCodeModule,
    AppOperationsModule
},
	data() {
		return {
			utils,
			state,
			sApp,

			deleteAppLoading: false
		}
	},
	computed: {
		app: function () {
			return sApp.currentApp;
		},
	},
	setup() {
	},
	mounted() {
	},
	methods: {
		async deleteApp() {
			if (!state.algonaut.account) return state.error('No account connected.');
			if (state.activeAccount !== this.app.creatorAddress) {
				state.log('The connected account is not the creator of the app, but we will attempt to delete the application anyway.');
			}
			if (window.confirm('Are you sure you want to delete this application? You may only do so if you are the creator.')) {
				this.deleteAppLoading = true;
				try {
					const res = await state.algonaut.deleteApplication(sApp.currentApp.index);
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

.link {
	text-decoration: underline;
	cursor: pointer;

	&:hover {
		opacity: 0.8;
	}
}
</style>