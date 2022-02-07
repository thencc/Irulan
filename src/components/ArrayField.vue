<template>
    <div class="field" v-for="(field, index) in fieldArray" :key="index">
        <input type="text" v-model="field.value" :placeholder="placeholder" @keyup.enter="addField" :ref="index === fieldArray.length-1 ? 'lastItem' : ''">
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

interface FieldItem {
    value: string
}

export default defineComponent({
    props: {
        model: {
            type: Array,
            // default: [{ value: '' }]
        },
        placeholder: String
    },
    data() {
        return {
            fieldArray: [{ value: '' }]
        }
    },
    mounted () {
        if (this.model) {
            this.fieldArray = this.model as any;
        }
    },
    methods: {
        addField(event: any) {
            console.log(event.target)
            if (event.target.parentNode.lastElementChild === event.target) {
                console.log('is last child.');
                this.fieldArray.push({ value: '' });
                if (this.$refs.lastItem) {
                    this.$refs.lastItem.focus();
                }
            }
        }
    }
})
</script>
<style lang="scss" scoped>
.field input {
    width: 100%;
}
</style>