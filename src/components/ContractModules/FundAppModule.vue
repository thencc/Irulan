<template>
	<BaseModule title="Fund App">
		<div v-if="app">
			<p>Current Balance: {{ app.balance ? app.balance / 1000000 : 0 }} ALGO</p>
			<form @submit.prevent="fundApp">
				<p v-if="escrowAddress" class="small muted">
					<span>Escrow address: </span>
					<router-link class="purple link" :to="state.sSearch.getSearchPath(escrowAddress || '')">
						{{ utils.shortAddr(escrowAddress) }}
					</router-link>
				</p>
				<p><input type="number" v-model="fundAppAmt" placeholder="ALGO to send" :disabled="fundAppLoading"></p>
				<div class="align-right">
					<LoadingButton type="submit" :loading="fundAppLoading">Fund App</LoadingButton>
				</div>
			</form>
		</div>
	</BaseModule>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import BaseModule from './BaseModule.vue';
import LoadingButton from '../LoadingButton.vue';

import { bus } from '../../bus';
import state from '../../state';
import { sApp } from '../../state/modules/sApp';
import * as utils from '../../utils';

export default defineComponent({
	components: {
		BaseModule,
		LoadingButton
	},
    data() {
		return {
			state,
			utils,
			fundAppAmt: null,
			fundAppLoading: false,
		}
	},
	computed: {
		app() {
			return sApp.currentApp;
		},
		escrowAddress: function () {
			if (sApp.currentApp && sApp.currentApp.index) {
				return state.sAlgo.algonaut.getAppEscrowAccount(sApp.currentApp.index);
			}
		}
	},
	watch: {
	},
	mounted() {
		// console.log('mounted');
	},
	methods: {
		async fundApp() {
			if (!this.escrowAddress || !this.fundAppAmt) return false;
			if (!state.sAlgo.algonaut.account) return state.error('No account connected.');
			if (!sApp.currentApp) return state.error('No app loaded');

			if (this.fundAppAmt < 1000 || window.confirm('Are you sure you want to send this many ALGO?')) {
				this.fundAppLoading = true;
				console.log(this.fundAppAmt);
				state.log(`Sending ${this.fundAppAmt} to ${this.escrowAddress}`);

				try {
					const res = await state.sAlgo.algonaut.sendAlgo({ to: this.escrowAddress, amount: this.fundAppAmt * 1000000 });
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
	}
})
</script>

<style scoped lang="css">

</style>