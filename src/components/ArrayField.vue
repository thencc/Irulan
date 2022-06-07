<template>
    <div
        v-for="(field, index) in modelValue"
        :key="index"
        xxkey="field.value.toString()"
        class="field"
        >
        <div class="field-label">
            {{ index }}.
        </div>
        <input
            v-model="field.value"
            type="text"
            :placeholder="placeholder"
            nothingenter="updateField(index, field)"
            :ref="index === modelValue.length-1 ? 'lastItem' : ''"
        />
        <button
            class="delete-button btn-link"
            @click.stop="removeField(index)"
        >
            X
        </button>
    </div>
    <div class="add-new-field">
        <span class="muted small">Add new: </span>
        <input
            v-model="newField.value"
            type="text"
            :placeholder="placeholder"
            :ref="'lastItem-2'"
            @keyup.enter.stop="addField(newField)"
        >
        <div v-show="newField.value.length" class="add-icon" @click.stop="addField(newField)">+</div>
    </div>
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
@import "../assets/_variables";

.add-new-field {
    display: flex;
    align-items: center;
}
.add-new-field > input {
    margin: 0 4px;
    padding-right: 26px;
}
.field {
    position: relative;
    margin-bottom: 1px;
}
.field input {
    // width: 100%;
    width: calc(100% - 20px);
    margin-left: 20px;
}
.add-icon {
    color: rgba(255,255,255,0.5);
    font-size: 16px;
    transform: translateX(-30px);
    padding: 8px;
    cursor: pointer;
}
.add-icon:hover {
    color: rgba(255, 255, 255, 1);
}
.field-label {
    position: absolute;
    top: 0;
    left: 0;
    line-height: 40px;
    font-size: 85%;
    color: #777079;
    text-align: right;
    padding-right: 2px;
    width: 20px;
}
.delete-button {
    position: absolute;
    top: 2px;
    right: 0;
    color: rgba(255,255,255,0.5);
}
.delete-button:hover {
    color: rgba(255, 255, 255, 1);
}
</style>