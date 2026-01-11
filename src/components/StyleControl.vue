<template>
    <div>
        <my-n-switch v-model:value="style_switch" checked-text="样式优化已启用" unchecked-text="样式优化" />
    </div>
</template>
<script setup>
import { ref, watch, watchEffect } from 'vue';
import { GM_setValue, GM_getValue } from '$';
import MyNSwitch from './MyNSwitch.vue';
const style_switch = ref(GM_getValue('style_switch', false));

watchEffect(() => {
    GM_setValue('style_switch', style_switch.value);
    if (style_switch.value) {
        document.body.setAttribute('styleControl', '');
    } else {
        document.body.removeAttribute('styleControl');
    }
});
</script>
