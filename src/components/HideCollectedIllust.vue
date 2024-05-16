<template>
  <div>
    <el-button
      v-show="!HIDE_STATUS"
      :loading="loading_statue"
      class="main-button"
      type="primary"
      plain
      @click="HIDE_STATUS = true"
      >隐藏已收藏作品
    </el-button>

    <el-button
      v-show="HIDE_STATUS"
      :loading="loading_statue"
      class="main-button"
      type="primary"
      plain
      @click="HIDE_STATUS = false"
      >恢复显示已收藏作品</el-button
    >
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import { Eleme } from "@element-plus/icons-vue";
const loading_statue = ref(false);
const loading = (statue) => {
  loading_statue.value = statue;
};

const Notification = (text) => {
  ElMessage(text);
};
const hideCollectedIllusts = () => {
  loading(true);
  return new Promise((resolve, reject) => {
    let liked = document.evaluate(
      '//*[local-name() = "svg" and @class="sc-j89e3c-1 bXjFLc"]/../../../../../../..',
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    let num = 0;
    for (var i = 0; i < liked.snapshotLength; i++) {
      let nodes = liked.snapshotItem(i);
      nodes.classList.add("illust-item");
      if (nodes.style.display != "none") {
        nodes.style.transition = "opacity 1s ease-in-out";
        nodes.style.opacity = "1";
        nodes.style.opacity = "0";
      }
    }
    setTimeout(() => {
      for (var i = 0; i < liked.snapshotLength; i++) {
        let nodes = liked.snapshotItem(i);
        // nodes.style.transition = 'opacity 1s';
        // nodes.style.opacity = '0'

        if (nodes.style.display != "none") {
          nodes.style.display = "none";
          num++;
        }
      }
      resolve(num);
    }, 1260);
  });
};
const showCollectedIllusts = () => {
  loading(true);
  return new Promise((resolve, reject) => {
    let liked = document.evaluate(
      '//*[local-name() = "svg" and @class="sc-j89e3c-1 bXjFLc"]/../../../../../../..',
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    let num = 0;
    for (var i = 0; i < liked.snapshotLength; i++) {
      let nodes = liked.snapshotItem(i);
      if (nodes.style.display == "none") {
        nodes.style.display = "block";
        num++;
      }

      //nodes.style.opacity = '1'
    }
    setTimeout(() => {
      for (var i = 0; i < liked.snapshotLength; i++) {
        let nodes = liked.snapshotItem(i);

        if (nodes.style.opacity == "0") {
          nodes.style.opacity = "1";
        }
      }
      resolve(num);
    }, 100);
  });
};

const observer = new MutationObserver(async (mutationsList, observer) => {
  setTimeout(() => {
    hideCollectedIllusts().then((num) => {
      loading(false);
      if (num > 0) Notification(`已隐藏${num}个已收藏的插画`);
    });
  }, 1000);
});

const HIDE_STATUS = ref(false);
watch(HIDE_STATUS, (NEW_STATUS, OLD_STATUS) => {
  if (NEW_STATUS) {
    hideCollectedIllusts().then((num) => {
      loading(false);
      if (num > 0) Notification(`已隐藏${num}个已收藏的插画`);
      observer.observe(
        document.querySelector("#root > .charcoal-token section  ul").parentElement
          .parentElement,
        {
          attributes: false,
          childList: true,
          subtree: true,
        }
      );
    });
  } else {
    observer.disconnect();
    showCollectedIllusts().then((num) => {
      loading(false);
      if (num > 0) Notification(`已恢复显示${num}个已收藏的插画`);
    });
  }
});
</script>
