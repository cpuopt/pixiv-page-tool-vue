<template>
    <n-switch class="switch" v-model:value="switchValue" :round="false" size="large" :rail-style="railStyle">
        <template #checked> {{ props.checkedText }} </template>
        <template #unchecked> {{ props.uncheckedText }} </template>
    </n-switch>
</template>
<script setup>
import { NSwitch } from 'naive-ui';
const props = defineProps({
    checkedText: {
        type: String
    },
    uncheckedText: {
        type: String
    }
});
const switchValue = defineModel('value');

function railStyle({ focused, checked }) {
    const style = {
        width: '100%',
        height: '32px',
        border: 'rgb(255, 255, 255) 1px solid',
        borderRaidius: '4px',
        background: 'transparent',
        boxShawdow: 'none'
    };
    if (checked) {
        style.background = 'rgb(162, 218, 255)';
    } else {
    }
    return style;
}
</script>

<style scoped lang="scss">
.n-switch {
    width: 100%;
    --n-rail-height: 32px !important;
    --n-height: 32px !important;
    --n-button-width-pressed: 28px !important;
    --n-button-width: 28px !important;
    --n-button-height: 28px !important;

    transition: background-color 0.5s ease;
    &:hover {
        background-color: rgb(162, 218, 255);
    }
}
</style>
