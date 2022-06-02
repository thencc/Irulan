<template>
	<div class="utility">
		<h3>{{ title }}</h3>
		<slot></slot>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
		title: {
			type: String,
			required: true
		}
	}
})
</script>

<style lang="scss" scoped>
@import '../../assets/variables';

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
</style>