<template>
    <div v-if="show" :class="`modal-overlay ${show ? 'is-active' : ''}`">
        <div class="modal vertical-center" :style="{ width: width }">
            <div class="close-modal" @click="close">X</div>
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useKeypress } from 'vue3-keypress';

import { sModal } from '../state/modules/sModal';

export default defineComponent({
    props: {
        show: Boolean,
        width: {
            type: String,
            default: '40%'
        }
    },
    setup(props, ctx) {
        const onEsc = function () {
            ctx.emit('close');
            sModal.modalId = '';
        }

        useKeypress({
            keyEvent: 'keydown',
            keyBinds: [
                {
                    keyCode: 'esc',
                    success: onEsc
                }
            ]
        })
    },
    methods: {
        close(data?: any) {
            this.$emit('close', data);
            sModal.modalId = '';
        }
    }
});
</script>

<style lang="scss">
@import '../assets/variables';

.modal-overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.6);
    z-index: 100;
}

.modal-overlay.active {

}

.modal-back {
    cursor: pointer;
    color: $textlight;
    display: block;

    &:hover { color: $text; }
}

.modal-title {
    padding: 0;
    margin: 0 0 1em 0;
    color: $yellow;
}

.modal {
    max-height: 98%;
    background-color: $bg;
    margin: 0 auto;
    padding: 10px;
    border: 2px solid $border;
    display: block;
    text-align: left;
    z-index: 200;

    .modal-content {
        overflow-y: scroll;
        // computed: 100vh - modal margin - title - actions fotter
        max-height: 80vh;
    }

    .modal-content, .modal-title {
        text-align: left;
    }
}

.close-modal {
    position: absolute;
    right: 0px;
    top: 0px;
    padding: 6px;
    margin: 4px;
    cursor: pointer;
    color: $textlight;

    &:hover {
        color: $pink;
    }
}

/** fancy animate in */
.modal-overlay.is-active > .modal {
    animation: slide-up 0.25s cubic-bezier(0.33, 1, 0.68, 1) forwards,
        fade-in 0.1s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

@keyframes slide-up {
    0% {
        top: calc(50% + 20px);
    }

    100% {
        top: 50%;
    }
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