<template>
	<BaseModule title="App Logs">
		<div style="display: flex; align-items: center; padding: 8px 0;">
			<!-- <div class="tab-items">
				<button v-for="t of tabItems" :class="`tab-item ${tabActive == t.id ? 'active' : ''}`"
					@click="tabActive = t.id">
					{{ t.text }}
				</button>
			</div> -->
			<!-- temp putting this option here while history mode is TBD -->
			<div>
				<span>
					decode method:
				</span>
				<select v-model="decodeAs" name="decodeAs" id="decodeAs">
					<option v-for="dO of decodeOptions" :value="dO.id">
						{{ dO.text }}
					</option>
				</select>
			</div>

			<div style="flex-grow: 1;"></div>
			<div class="roundCurrentIndicator yellow" title="Current Round">
				{{ roundCurrent }}
			</div>
		</div>


		<div class="tab-content">
			<template v-if="tabActive == 'realtime'">
				<div v-if="false" class="log-options">
					<!-- <div style="display: flex; align-items: center; padding: 4px 0;">
						<input v-model="options.onlyMyLogs" type="checkbox" id="onlyMyLogs">
						<label for="onlyMyLogs">only my logs?</label>
					</div> -->

					<!-- <div>
						<input v-model.number="options.minRound" :placeholder="roundAtLoad.toString()" type="number"
							id="minRound">
						<label for="minRound">min round</label>
					</div>
					<div>
						<input v-model.number="options.maxRound" :placeholder="roundAtLoad.toString()" type="number"
							id="maxRound">
						<label for="maxRound">max round</label>
					</div>
					<div>
						<input v-model="options.txId" type="text" id="txId">
						<label for="txId">only this txn</label>
					</div> -->
					<div>
						<span>
							decode method:
						</span>
						<select v-model="decodeAs" name="decodeAs" id="decodeAs">
							<option v-for="dO of decodeOptions" :value="dO.id">
								{{ dO.text }}
							</option>
						</select>
					</div>
				</div>

				<div class="logs-output">
					<div class="code-block" ref="codeOutput">
						<div v-for="b of realtimeLogs" :key="b.round" class="round-group">
							<div>
								<span class="dimmed">Round: </span>
								<span class="yellow">{{ b.round }}</span>
							</div>

							<div v-for="(t, iT) of b.txnsLogs" :key="t.txid" class="txn-logs">
								<div class="txn-line">
									<span class="dimmed">Txn:&nbsp;</span>
									<span class="txn-id blue">
										{{ t.txid }}
									</span>
								</div>
								<div v-for="(l, iL) of t.logs" :key="iL" class="log-line">
									<span class="dimmed">
										{{ iL + 1 }}.
									</span>
									<span>
										{{ getReadable(l) }}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

			</template>
			<template v-else-if="tabActive == 'history'">
				<div class="log-options">
					<div style="display: flex; align-items: center; padding: 4px 0;">
						<input v-model="options.onlyMyLogs" type="checkbox" id="onlyMyLogs">
						<label for="onlyMyLogs">only my logs?</label>
					</div>
					<div>
						<input v-model.number="options.minRound" :placeholder="roundAtLoad.toString()" type="number"
							id="minRound">
						<label for="minRound">min round</label>
					</div>
					<div>
						<input v-model.number="options.maxRound" :placeholder="roundAtLoad.toString()" type="number"
							id="maxRound">
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
						<select v-model="decodeAs" name="decodeAs" id="decodeAs">
							<option v-for="dO of decodeOptions" :value="dO.id">
								{{ dO.text }}
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
						<div v-for="(t, iT) of logTxns" :key="t.txid" class="txn-logs">
							<div style="text-align: left;" class="line">
								<b style="color: aqua">
									{{ t.txid }}
								</b>
							</div>
							<div v-for="(l, iL) of t.logs" :key="iL" class="line" style="text-align: right;">
								{{ iL + 1 }}.
								{{ getReadable(l) }}
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
	</BaseModule>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseModule from './BaseModule.vue';

import state from '../../state';
import { bus } from '../../bus';

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
			tabItems: [
				{
					id: 'realtime',
					text: 'Realtime'
				},
				{
					id: 'history',
					text: 'History'
				}
			],
			// tabActive: 'realtime' as 'realtime' | 'history',
			tabActive: 'realtime',

			options: {
				onlyMyLogs: true,
				sender: '',
				minRound: null as null | number,
				maxRound: null as null | number,
				txId: ''
			},
			logTxns: [] as LogEntry[],

			realtimeLogs: [] as {
				round: number;
				txnsLogs: LogEntry[];
			}[],

			decodeAs: 'string',
			decodeOptions: [
				{
					id: 'string',
					text: 'String'
				},
				{
					id: 'addr',
					text: 'Address'
				},
				{
					id: 'none',
					text: 'None'
				}
			],

			roundAtLoad: 0,
			roundCurrent: 0,
			logsTimer: 0 as any,
			roundTimer: 0 as 0 | NodeJS.Timer,

			// lastRoundGot: 0,
		}
	},
	computed: {
		canWatchRealtimeLogs() {
			return !!(state.sAlgo.algonaut.account && this.tabActive == 'realtime');
		}
	},
	watch: {
		tabActive: {
			handler(t: 'realtime' | 'history') {
				// console.log('t', t);
				if (t == 'realtime') {
					// reset logs + set get options
					this.options.onlyMyLogs = true;
					this.options.txId = '';
				} else if (t == 'history') {
					console.warn('TODO - history mode');
				}
			},
			immediate: true
		},
		roundCurrent: {
			async handler(roundC: number, roundLast: number) {
				// console.log('roundCurrent updated', roundC);

				if (roundLast !== roundC) {
					if (this.tabActive == 'realtime') {
						await this.getRealtimeLogs(roundC);
					}
				}
			}
		}
	},
	async mounted() {
		// console.log('mounted');

		this.startRoundWatcher();
		this.setCurrentRound(); // once on load + watch/interval

		this.startAppCallWatcher();
	},
	beforeUnmount() {
		this.stopRoundWatcher();
		this.stopAppCallWatcher();
	},
	methods: {
		startRoundWatcher() {
			// console.log('watchCurrentRound');
			this.roundTimer = setInterval(this.setCurrentRound, 4000); // get round every 4s so we get ALL rounds + occasionally dup round but only get more inside if round is different
		},
		stopRoundWatcher() {
			// console.log('stopRoundWatcher');
			if (this.roundTimer) {
				console.log('clearing roundTimer');
				clearInterval(this.roundTimer);
			}
		},
		async setCurrentRound() {
			try {
				const status = await state.sAlgo.algonaut.algodClient.status().do();
				this.roundCurrent = status['last-round'];
			} catch(e) {
				console.warn('err getting currentRound');
				console.log(e);
			}
		},

		startAppCallWatcher() {
			bus.on('app-call-completed', this.appCallCompleted);
		},
		stopAppCallWatcher() {
			bus.off('app-call-completed', this.appCallCompleted);
		},
		async appCallCompleted(round?: number) {
			// console.log('appCallCompleted', round);
			if (round && typeof round == 'number' && round > this.roundCurrent) {
				this.roundCurrent = round;
			} else {
				await this.setCurrentRound();
			}
		},

		async getRealtimeLogs(round: number) {
			// console.log('getRealtimeLogs', round);

			this.options.minRound = round;
			this.options.maxRound = round;

			let txnLogs = await this.getAppLogs();
			if (txnLogs) {
				this.realtimeLogs.push({
					round: round,
					txnsLogs: txnLogs
				});

				await this.$nextTick();
				this.scrollToLatest();
			}
		},

		async startLogsWatcher() {
			console.log('startLogsWatcher');

			// interval (+ disable changing options while running?)
			this.logsTimer = setInterval(this.getAppLogs, 3000);
			await this.getAppLogs();
		},
		stopLogsWatcher() {
			console.log('stopLogsWatcher');
			if (this.logsTimer) {
				console.log('stopping logsTimer');
				clearInterval(this.logsTimer);
			}
		},

		// ex app 93272663 w logs
		// minRoud = 21924461
		async getAppLogs() {
			// console.log('getAppLogs started');

			if (!state.sAlgo.algonaut) {
				console.warn('no algonaut');
				return;
			}
			if (!state.sAlgo.algonaut.indexerClient) {
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
			// console.log('getAppLogs options:', this.options);

			let logsReq = state.sAlgo.algonaut.indexerClient.lookupApplicationLogs(this.appId);

			if (this.options.onlyMyLogs) {
				if (state.sAlgo.algonaut.account) {
					logsReq = logsReq.sender(state.sAlgo.algonaut.account.address);
				} else {
					console.log('FYI - you are not logged in, cannot show only my logs...')
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
			// console.log('appLogs', appLogs);

			if (!appLogs) {
				console.warn('no appLogs');
				return;
			}

			const logData = appLogs['log-data'] as LogEntry[];
			return logData;
		},
		getReadable(logVal: string) {
			if (this.decodeAs == 'string') {
				return state.sAlgo.algonaut.fromBase64(logVal);
			} else if (this.decodeAs == 'addr') {
				return state.sAlgo.algonaut.valueAsAddr(logVal);
			} else if (this.decodeAs == 'none') {
				return logVal;
			} else {
				return logVal;
			}
		},
		scrollToLatest() {
			// console.log('scrollToLatest');
			(this.$refs.codeOutput as Element).scrollTo({
				left: 0,
				top: (this.$refs.codeOutput as Element).scrollHeight,
				behavior: 'smooth'
			});
		},
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
	max-height: 240px;
	overflow-y: scroll;
}
.round-group {
	padding: 8px 0;
}
.log-line {
	/* text-align: right; */
	padding: 2px 0;
	padding-left: calc(6.6px * 4);
}
.txn-line {
	text-align: left;
	padding: 6px 0 2px 0;
	padding-left: calc(6.6px * 2);
}



.tab-items {
	display: flex;
}
.tab-item {
	background-color: transparent;
	/* background-color: #273541; */
	/* border: 1px solid transparent; */
	border: 1px solid #3D4D5B;
	/* border */
	/* border-bottom: 3px solid #3D4D5B; */
}
.tab-item.active {
	background-color: #273541;
	/* border: 1px solid transparent; */
	border: 1px solid #3D4D5B;
	border-bottom: 2px solid #3D4D5B;
}
.tab-item:hover {
	background-color: #314251;
}

.yellow {
	color: #FFD866;
}
.blue {
	color: #ABD0D8;
}

.roundCurrentIndicator {
	background: #ffd9661e;
	color: #FFD866;
	font-size: 12px;
	border: 1px solid #ffd96652;
	padding: 8px 12px;
}
.dimmed {
	color: rgba(255, 255, 255, 0.5)
}
</style>