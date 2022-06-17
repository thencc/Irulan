<template>
	<div>
		AppPanel
		<router-link to="/about">about</router-link>
		<router-link to="/terms">terms</router-link>
		<router-link to="/testnet">dash</router-link>
		<router-link to="/testnet/app/123">app</router-link>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import state from '../../state';

export default defineComponent({
	components: {
	},
	setup() {
	},
	mounted() {
	},
	data() {
		return {
		}
	},
	methods: {
	}
});
</script>

<style scoped lang="css">
</style>