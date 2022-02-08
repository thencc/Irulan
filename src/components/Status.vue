<template>
<span class="status" v-if="state.connected">
    <span class="circle"></span>
    <span class="status-text">
        <span class="ledger green">{{ state.algonaut.config?.LEDGER || '' }}</span>
        <span class="server muted">{{ hostname }}</span>
    </span>
</span>

<span v-if="!state.connected && !state.connecting" class="status disconnected">
    <span class="status-text">Set Up Node</span>
</span>
<span v-if="state.connecting" class="status connecting">
    Connecting...
</span>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import state from '../state';
import { parseDomain, fromUrl } from 'parse-domain';

export default defineComponent({
    data() {
        return {
            state
        };
    },
    computed: {
        hostname () {
            const server = state.algonaut.config?.BASE_SERVER;
            if (server) {
                var name =  parseDomain(fromUrl(server));
                if (name.type === 'RESERVED') return name.hostname;
                return (name as any).domain;
            }
            return '';
        }
    }
});
</script>
<style scoped lang="scss">
@import '../assets/variables';
.status {
    position: relative;
}
.circle {
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: $green;
    border-radius: 100%;
    margin-right: 4px;
    position: absolute;
    top: 2px;
}
.ledger {
    text-transform: uppercase;
    font-size: 90%;
    margin-left: 15px;
}

.server {
    margin-left: 3px;
    text-transform: uppercase;
    font-size: 90%;

}
</style>
