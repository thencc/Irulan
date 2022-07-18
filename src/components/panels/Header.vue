<template>
	<header class="header">
		<div class="header-left">
			<h1>Irulan</h1>

			<button class="about-link btn-link-muted" @click="sModal.modalId = 'about'">What is this?</button>
			<teleport v-if="sModal.modalId == 'about'" to="#modal-teleport-dest">
				<AboutModal />
			</teleport>
		</div>
		<div style="flex-grow: 1"></div>
		<div class="header-right">
			<CreateAsset />
			<Deploy />
			<Account />
			<Setup />
		</div>
	</header>
</template>


<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';

import state from '../../state';
import { sModal } from '../../state/modules/sModal';

// components
import Browser from '../Browser.vue';
import ContractTool from '../ContractTool.vue';
import Account from '../Account.vue';
import Deploy from '../Deploy.vue';
import CreateAsset from '../CreateAsset.vue';

export default defineComponent({
	components: {
		Setup: defineAsyncComponent(
			// () => '../Setup.vue'
			() => import('../Setup.vue')
		),
		Account,
		Browser,
		ContractTool,
		Deploy,
		CreateAsset,

		AboutModal: defineAsyncComponent(() => import('../modals/AboutModal.vue'))
	},
	data() {
		return {
			sModal,
			showAbout: false
		}
	},
	// mounted() {
	// },
	methods: {
	}
});
</script>

<style lang="scss">
@import '../../assets/_variables.scss';
@import '../../assets/basics.scss';

.header {
	background-color: $bgdark;
	padding: 10px;
	display: flex;
	height: $headerheight;

	h1 {
		flex: 0 0 auto;
		background: linear-gradient(45deg, #FFD78A 0%, #EC66AA 16%, #7B4CDE 33%, #69DEE6 56%, #7B4DDF 70%, #FF6188 85%, #FFD866 100%);
		font-weight: bold;
		font-size: 1.5em;
		margin: 0;
		padding: 0;
		background-size: 800% auto;

		color: $yellow;
		background-clip: text;
		text-fill-color: transparent;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;

		animation: shine 300s linear infinite;
		@keyframes shine {
			to {
				background-position: 800% center;
			}
		}
	}
}

.header-left {
	// flex: 1 1 50%;
	display: flex;

	h1, .about-link {
		line-height: 2em;
		margin: 0 10px;
	}

	.about-link {
		flex: 0 1 auto;
	}
}

.header-right {
	text-align: right;
	// flex: 1 1 50%;

	button {
		margin: 5px 5px 0;
	}
}

.actions button {
	margin: 5px 0px 0 10px;

	&:last-child {
		margin-right: 0;
	}
}

header {
	.header-info {
		flex: 0 0 75%;
		text-align: right;
		font-size: 0.8em;
		padding-top: 3px;
		line-height: 1em;
		color: $textlight;
	}
}

.instructions {
	font-size: 0.75em;
	color: $textlight;
}

// LOG
.terminal {
	background: #000;
	color: white;
	height: 300px;
	overflow-y: scroll;
	padding: 5px;
	font-size: 0.8em;
}

.line.success {
	color: $terminalsuccess;
}

.line.error {
	color: $terminalerror;
}

td {
	border: 1px solid $border;
}

th {
	text-align: left;
}

table {
	margin-bottom: 15px;
}
</style>