<template>
    <div>
        <el-switch v-model="HIDE_STATUS" :loading="loading_statue" active-text="隐藏" inactive-text="显示" />
    </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { getLikedIllusts } from '../utils/pixivscripts';
import { GM_setValue, GM_getValue } from '$';

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
        let liked = getLikedIllusts();
        let num = 0;
        for (const node of liked) {
            node.classList.add('illust-item');
            if (node.style.display != 'none') {
                node.style.transition = 'opacity 0.5s ease-in-out';
                node.style.opacity = '1';
                node.style.opacity = '0';
            }
        }
        setTimeout(() => {
            for (const node of liked) {
                if (node.style.display != 'none') {
                    node.style.display = 'none';
                    num++;
                }
            }
            setTimeout(() => {
                resolve(num);
            }, 100);
        }, 530);
    });
};
const showCollectedIllusts = () => {
    return new Promise((resolve, reject) => {
        let liked = getLikedIllusts();
        let num = 0;
        for (const node of liked) {
            if (node.style.display == 'none') {
                node.style.display = 'block';
                num++;
            }
        }
        setTimeout(() => {
            for (const node of liked) {
                if (node.style.opacity == '0') {
                    node.style.opacity = '1';
                }
            }
            setTimeout(() => {
                resolve(num);
            }, 530);
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

const HIDE_STATUS = ref(GM_getValue("HIDE_STATUS", false));
watch(HIDE_STATUS, async (NEW_STATUS, OLD_STATUS) => {
    GM_setValue("HIDE_STATUS", NEW_STATUS);
    if (NEW_STATUS) {
        hideCollectedIllusts().then((num) => {
            loading(false);
            if (num > 0) Notification(`已隐藏${num}个已收藏的插画`);
            observer.observe(document.querySelector('#root , #__next  section  ul').parentElement.parentElement, {
                attributes: false,
                childList: true,
                subtree: true
            });
        });
    } else {
        observer.disconnect();
        loading(true);
        const num = await showCollectedIllusts();
        if (num > 0) Notification(`已恢复显示${num}个已收藏的插画`);
        loading(false);
    }
}, { immediate: true });


</script>
