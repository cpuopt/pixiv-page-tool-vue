<template>
    <div>
        <el-button v-show="!style_switch" class="main-button" type="primary" plain @click="style_switch = true">启用优化样式 </el-button>

        <el-button v-show="style_switch" class="main-button" type="primary" plain @click="style_switch = false">关闭优化样式</el-button>
    </div>
</template>
<script setup>
import { ref, watch, watchEffect } from 'vue';
import { Eleme } from '@element-plus/icons-vue';
import { getLikedIllusts } from '../utils/pixivscripts';

const style_switch = ref(false);


watchEffect(() => {
  if (style_switch.value) {
    document.body.setAttribute('styleControl', '')
  } else {
    document.body.removeAttribute('styleControl')
  }
})
</script>
