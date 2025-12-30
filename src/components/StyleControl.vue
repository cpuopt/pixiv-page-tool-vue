<template>
  <div>
    <el-switch v-model="style_switch" active-text="启用样式优化" inactive-text="关闭样式优化"></el-switch>
  </div>
</template>
<script setup>
import { ref, watch, watchEffect } from 'vue';
import { Eleme } from '@element-plus/icons-vue';
import { getLikedIllusts } from '../utils/pixivscripts';
import { GM_setValue, GM_getValue } from '$';


const style_switch = ref(GM_getValue("style_switch", false));

watchEffect(() => {
  GM_setValue("style_switch", style_switch.value)
  if (style_switch.value) {
    document.body.setAttribute('styleControl', '')
  } else {
    document.body.removeAttribute('styleControl')
  }
})
</script>
