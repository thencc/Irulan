<template>
    <BaseModule title="App Logs">
		<div class="log-options">
			<div style="display: flex; align-items: center; padding: 4px 0;">
				<input v-model="options.onlyMyLogs" type="checkbox" id="onlyMyLogs">
				<label for="onlyMyLogs">only my logs?</label>
			</div>
			<div>
				<input v-model.number="options.minRound" :placeholder="roundAtLoad.toString()" type="number" id="minRound">
				<label for="minRound">min round</label>
			</div>
			<div>
				<input v-model.number="options.maxRound" :placeholder="roundAtLoad.toString()" type="number" id="maxRound">
				<label for="maxRound">max round</label>
			</div>
			<div>
				<input v-model="options.txId" type="text" id="txId">
				<label for="txId">only this txn</label>
			</div>
			<div>
				<span>
					decode as
				</span>
				<select name="decodeAs" id="decodeAs">
					<option value="string">
						string
					</option>
					<option value="addr">
						addr
					</option>
				</select>
			</div>
		</div>

		<div style="display: flex;">
			<button @click="getAppLogs">
				get logs
			</button>
			<button @click="startLogsWatcher">
				start
			</button>
			<button @click="stopLogsWatcher">
				stop
			</button>
		</div>

		<div class="logs-output">
			<div class="code-block">
				<div
					v-for="(t, iT) of logTxns"
					:key="t.txid"
					class="log-txn"
				>
					<div style="text-align: left;" class="line">
						<b style="color: aqua">
							{{ t.txid }}
						</b>
					</div>
					<div
						v-for="(l, iL) of t.logs"
						:key="iL"
						class="line"
						style="text-align: right;"
					>
						{{ iL + 1 }}.
						{{ getReadable(l) }}
					</div>
				</div>
			</div>
		</div>
	</BaseModule>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseModule from './BaseModule.vue';

import state from '../../state';

interface LogEntry {
	logs: string[];
	txid: string;
}

export default defineComponent({
	components: {
		BaseModule
	},
	props: {
		appId: {
			type: Number,
			required: true
		}
	},
    data() {
		return {
			options: {
				onlyMyLogs: true,
				minRound: null as null | number,
				maxRound: null as null | number,
				txId: ''
			},
			logTxns: [] as LogEntry[],
			roundAtLoad: 0
		}
	},
	async mounted() {

		// default minRound to currentRound
		// this.options.minRound = await this.getCurrentRound();
		this.roundAtLoad = await this.getCurrentRound();
	},
	methods: {
		async getCurrentRound() {
			const txnParams = await state.algonaut.algodClient.getTransactionParams().do();
			return txnParams.firstRound;
		},
		async startLogsWatcher() {
			console.log('startLogsWatcher');
			console.warn('TODO intervaled get logs');

			// interval + disable changing options while running
			// this.getAppLogs();
		},
		stopLogsWatcher() {
			console.log('stopLogsWatcher');
			console.warn('TODO');
		},
		async getAppLogs() {
			console.log('getAppLogs');

			if (!state.algonaut)  {
				console.warn('no algonaut');
				return;
			}
			if (!state.algonaut.indexerClient) {
				console.warn('no indexerClient');
				return;
			}

			// ok to get?
			if (
				!this.options.onlyMyLogs &&
				!this.options.minRound &&
				!this.options.maxRound &&
				!this.options.txId
			) {
				console.warn('need some filter set');
				alert('some log filters must be set');
				return;
			}

			// ex app 93272663 w logs
			// minRoud = 21924461

			let logsReq = state.algonaut.indexerClient.lookupApplicationLogs(this.appId);

			if (this.options.onlyMyLogs) {
				if (state.algonaut.account) {
					logsReq = logsReq.sender(state.algonaut.account.addr);
				} else {
					alert('you are not logged in, cannot show only my logs...')
				}
			}

			if (this.options.minRound) {
				logsReq = logsReq.minRound(this.options.minRound);
			}

			if (this.options.maxRound) {
				logsReq = logsReq.maxRound(this.options.maxRound);
			}

			if (this.options.txId) {
				logsReq = logsReq.txid(this.options.txId);
			}

			const appLogs = await logsReq.do();
			console.log('appLogs', appLogs);

			if (!appLogs) {
				console.warn('no appLogs');
				return;
			}

			const logData = appLogs['log-data'];
			this.logTxns = logData as LogEntry[];
		},
		getReadable(logVal: string) {
			let addr = state.algonaut.valueAsAddr(logVal);
			// console.log(addr);
			let str = state.algonaut.fromBase64(logVal);
			// console.log(str);

			return `${addr} | ${str}`;
		}
	}
})
</script>

<style scoped lang="css">
.log-options {
	display: flex;
	flex-direction: column;
	/* align-items: center; */
	width: 100%;
	padding: 8px 0;
}
.log-options > div {
	margin: 1px 0;
}

.code-block {
	width: 100%;
	overflow-x: scroll;
	word-break: break-all;
	display: flex;
	flex-direction: column;
    background: #18171a;
    padding: 5px;
	font-size: 11px;
}
.log-txn {
	padding: 8px 0;
}
.code-block .line {
	/* height: 14px; */
}
</style>
