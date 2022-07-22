<template>
	<BaseModule title="Algonaut.js Code">
		<div class="algonaut-code">
			<p class="small muted">Click to copy</p>
			<pre @click="copyAlgoCode" class="code-block">{{ state.sAlgo.algonautJSCode }}</pre>
		</div>
	</BaseModule>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { copyText } from 'vue3-clipboard';

import BaseModule from './BaseModule.vue';

import { bus } from '../../bus';
import state from '../../state';
import { sApp } from '../../state/modules/sApp';
import * as utils from '../../utils';

export default defineComponent({
	components: {
		BaseModule
	},
    data() {
		return {
			state,
			// utils,
		}
	},
	watch: {
	},
	// mounted() {
	// },
	methods: {
		copyAlgoCode() {
			copyText(state.sAlgo.algonautJSCode, undefined, (error: any, event: any) => {
				if (error) {
					state.error(error);
				} else {
					state.log('Copied to clipboard.');
				}
			});
		}
	}
})
</script>

<style scoped lang="scss">
@import '../../assets/variables';

.code-block {
	background: $bgdark;
	padding: 5px;

	&:hover {
		background-color: lighten($bgdark, 5%);
		cursor: pointer;
	}
}
</style>