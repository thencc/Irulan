<template>
    <button class="btn-purple" @click="sModal.modalId = 'account'">
        {{ state.sAlgo.activeAccount ? accountDisplay : 'Connect Account' }}
    </button>

    <teleport v-if="sModal.modalId == 'account'" to="#modal-teleport-dest">
        <AccountModal />
    </teleport>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';

import state from '../state';
import { sModal } from '../state/modules/sModal';
import * as utils from '../utils';

export default defineComponent({
    components: {
        AccountModal: defineAsyncComponent(() => import('../components/modals/AccountModal.vue'))
    },
    data() {
        return {
            state,
            sModal
        }
    },
    computed: {
        accountDisplay() {
            if (state.sAlgo.activeAccount && state.sAlgo.activeAccount.length) {
                return utils.shortAddr(state.sAlgo.activeAccount);
            }
        },
    },
    methods: {
    }
})
</script>

<style scoped lang="css">

</style>