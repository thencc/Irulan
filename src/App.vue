<template>
	<!-- <router-view name="header"></router-view> -->
	<!-- <router-view name="default"></router-view> -->

	<transition :name="fadeDelay" mode="out-in">
		<router-view name="header"></router-view>
	</transition>
	<transition :name="fadeDelay" mode="out-in">
		<router-view name="default"></router-view>
	</transition>

	<!-- <div :class="`modal ${modal ? 'is-active' : ''}`">
		<div class="modal-background" @click="$root.closeModal()"></div>
		<div id="modal-content" class="modal-content"></div>
	</div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from './state';
import Setup from './components/Setup.vue';
import Log from './components/Log.vue';
import Browser from './components/Browser.vue';
import ContractTool from './components/ContractTool.vue';
import Account from './components/Account.vue';
import Modal from './components/Modal.vue';
import Deploy from './components/Deploy.vue';
import CreateAsset from './components/CreateAsset.vue';

export default defineComponent({
	components: {
		Setup,
		Log,
		Account,
		Modal,
		Browser,
		ContractTool,
		Deploy,
		CreateAsset
	},
	data() {
		return {
			fadeDelay: '',
		}
	},
	setup() {
	},
	mounted() {
		// only set transition name after page load (solution for NO initial page load fade-in, but fade trans all further router moves)
		// add in if you want a router trans
		setTimeout(() => this.fadeDelay = 'fade', 1000);
	},
	created() {
	},
	methods: {
	}
})
</script>

<style lang="scss">
@import 'assets/_variables.scss';
@import 'assets/basics.scss';

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

.container {
	display: flex;
	position: absolute;
	top: $headerheight;
	bottom: 0;
	left: 0;
	right: 0;

	.left-col {
		flex: 0 0 40%;
		display: flex;
		max-width: 420px;
	}

	.right-col {
		// flex: 1 0 60%;
		flex: 1 0 min-content;

		.module {
			margin-left: 0;
		}
	}
}

.left-col, .right-col {
	display: flex;
	flex-direction: column;

	.module {
		flex: 1 1 25%;
	}
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

/* --- VUE CSS TRANSITIONS --- */
/** FADE */
// fyi css transitions + animations both work
.fade-enter-active {
	// animation: fade-in 0.2s;
	animation: fade-in 1s;
}
.fade-leave-active {
	animation: fade-in 0.2s reverse;
}
@keyframes fade-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
</style>