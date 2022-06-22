<template>
    <a :href="link" target="_blank"><slot></slot></a>
</template>
<script>
import { defineComponent } from 'vue';
import state from '../state';

export default defineComponent({
    props: {
        type: String,
        address: String
    },
    computed: {
        link: function () {
            let baseUrl = 'https://testnet.algoexplorer.io/';
            if (state.sAlgo.algonaut.config.LEDGER === 'MainNet') {
                baseUrl = 'https://mainnet.algoexplorer.io/'
            }
            return baseUrl + this.type + '/' + this.address;
        }
    }
})
</script>

<style scoped lang="scss">
$linkcolor: #48cae4;

a {
    color: $linkcolor;

    &:hover {
        color: lighten($linkcolor, 20%);
    }

    &:visited {
        color: darken($linkcolor, 20%);
    }
}
</style>
