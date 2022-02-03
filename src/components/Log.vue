<template>
    <div class="terminal">
        <p v-for="line in state.terminal" :key="line.message" :class="'line ' + line.type">{{ line.message }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';

export default defineComponent({
    data() {
        return { 
            state 
        }
    }
})
</script>

<style scoped lang="scss">
@import '../assets/variables';
.terminal {
    flex: 1 1 30%;
    padding: 5px 10px;
    border-right: 2px solid $border;
    border-left: 2px solid $border;

    p {
        margin: 0;
        padding: 2px 0;
    }
}
</style>