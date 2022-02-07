<template>
    <button :disabled="loading"><slot v-if="!loading"></slot><span v-if="loading">Loading...</span></button>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        loading: Boolean,
    }
})
</script>
<style lang="scss" scoped>

</style>