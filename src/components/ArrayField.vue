<template>
    <div class="field" v-for="(field, index) in modelValue" xxkey="field.value.toString()" :key="index">
        <input type="text" v-model="field.value" :placeholder="placeholder" xxkeyup.enter="updateField(index, field)" :ref="index === modelValue.length-1 ? 'lastItem' : ''" />
        <button style="position: absolute; top: 0; right: 0;" @click.stop="removeField(index)">X</button>
    </div>
    <input type="text" v-model="newField.value" :placeholder="placeholder" @keyup.enter.stop="addField(newField)" :ref="'lastItem-2'">
    <!-- <button @click.stop="removeField(modelValue.length - 1)">X remove last</button> -->
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

interface FieldItem {
    value: string
}

export default defineComponent({
    props: {
        // field: {
        //     type: Array,
        //     // default: [{ value: '' }]
        // },
        modelValue: {
            // type: Array,
            // default: () => [{ value: '' }]
            type: Array as PropType<{value: String}[]>,
            default: () => [] as {value: string}[]
        },
        placeholder: String
    },
    data() {
        return {
            fieldArray: [{ value: '' }],
            newField: { value: '' }
        }
    },
    mounted () {
        // if (this.model) {
        //     this.fieldArray = this.model as any;
        // }
    },
    watch: {
        field: {
            immediate: true,
            handler(f: any) {
                //
                this.fieldArray = f;
            }
        }
    },
    methods: {
        addField(event: any) {
            console.log('addField', event);
            this.modelValue.push({...event});
            this.newField.value = '';

            // console.log(event.target);
            // if (event.target.parentNode.lastElementChild === event.target) {
            //     console.log('is last child.');
            //     this.fieldArray.push({ value: '' });
            //     if (this.$refs.lastItem) {
            //         (this.$refs.lastItem as any).focus();
            //     }
            // }
        },
        // removeArg
        removeField(idx: number) {
            console.log('removeField', idx);
            this.modelValue.splice(idx, 1);

            // setTimeout(() => {
            //     this.modelValue.splice(idx, 1);
            //     // this.$emit('update:modelValue', this.modelValue.slice(0, this.modelValue.length - 2));
            // }, 500);
        }
    }
})
</script>
<style lang="scss" scoped>
.field {
    position: relative
}
.field input {
    width: 100%;
}
</style>