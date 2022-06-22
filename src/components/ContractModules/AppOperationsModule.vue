<template>
	<BaseModule title="App Operations">
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
			<div class="align-right">
				<LoadingButton type="submit" @click="callApp" :loading="callAppLoading">
					Call App
				</LoadingButton>
			</div>
		</div>
	</BaseModule>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import BaseModule from './BaseModule.vue';
import ArrayField from '../ArrayField.vue';
import LoadingButton from '../LoadingButton.vue';

import { bus } from '../../bus';
import state from '../../state';
import { sApp } from '../../state/modules/sApp';
import * as utils from '../../utils';

export default defineComponent({
	components: {
		BaseModule,
		ArrayField,
		LoadingButton
	},
    data() {
		return {
			state,
			// utils,

			callAppArgs: {
				operationType: 'callApp',
				methodName: '',
				appArgs: [],
				accounts: [],
				applications: [],
				assets: []
			},
			callAppLoading: false,
		}
	},
	watch: {
	},
	mounted() {
	},
	methods: {
		async callApp() {
			if (!state.algonaut.account) return state.error('No account connected.');
			this.callAppLoading = true;
			state.sAlgo.algonautJSCode = '';

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

			state.sAlgo.algonautJSCode =
				`const response = await algonaut.${this.callAppArgs.operationType}({
    appIndex: ${sApp.currentApp.index},
    appArgs: ${JSON.stringify(args)},
    optionalFields: ${unquotedArgs}
});`;

			state.log(`Calling app with args: ${JSON.stringify(this.callAppArgs)}`);
			try {
				let res;
				if (this.callAppArgs.operationType === 'callApp') {
					// res = await state.algonaut.callApp({
					//     appIndex: sApp.currentApp.index,
					//     appArgs: args,
					//     optionalFields: optionalFields
					// });

					// defaultTxnFee test (sometime unusual fees are needed to test contract-to-contract calls where sender covers inner txn fee. this will also need to be implemented in deploy app etc)
					const txn = await state.algonaut.atomicCallApp({
						appIndex: sApp.currentApp.index,
						appArgs: args,
						optionalFields: optionalFields
					});
					txn.transaction.fee = state.sAlgo.defaultTxnFee;
					res = await state.algonaut.sendTransaction(txn);
				} else if (this.callAppArgs.operationType === 'optInApp') {
					res = await state.algonaut.optInApp({
						appIndex: sApp.currentApp.index,
						appArgs: args,
						optionalFields: optionalFields
					});
				} else if (this.callAppArgs.operationType === 'closeOutApp') {
					res = await state.algonaut.closeOutApp({
						appIndex: sApp.currentApp.index,
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
					bus.emit('app-call-completed', parseInt(res.message.substring(res.message.length - 9)));
				}
			} catch (e) {
				console.log(e);
				state.error('Transaction error.');
			}

			this.callAppLoading = false;
		},
	}
})
</script>

<style scoped lang="css">

</style>