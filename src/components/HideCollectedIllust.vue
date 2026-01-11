<template>
    <div>
        <my-n-switch v-model:value="HIDE_STATUS_REF" :loading="loading_statue" checked-text="隐藏已收藏的插画" unchecked-text="显示已收藏的插画" />
    </div>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getLikedIllusts } from '../utils/pixivscripts';
import { GM_setValue, GM_getValue } from '$';
import MyNSwitch from './MyNSwitch.vue';
import { debounce } from 'lodash';

const loading_statue = ref(false);

const loading = (statue) => {
    loading_statue.value = statue;
};

const Notification = (text) => {
    ElMessage(text);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hideCollectedIllusts = async (liked) => {
    let num = 0;
    for (const node of liked) {
        node.classList.add('illust-item');
        if (node.style.display != 'none') {
            node.style.transition = 'opacity 0.5s ease-in-out';
            node.style.opacity = '1';
            node.style.opacity = '0';
        }
    }

    await sleep(530);
    for (const node of liked) {
        if (node.style.display != 'none') {
            node.style.display = 'none';
            num++;
        }
    }
    await sleep(100);
    return num;
};

const showCollectedIllusts = async (liked) => {
    let num = 0;
    for (const node of liked) {
        if (node.style.display == 'none') {
            node.style.display = 'block';
            num++;
        }
    }

    await sleep(100);
    for (const node of liked) {
        if (node.style.opacity == '0') {
            node.style.opacity = '1';
        }
    }
    await sleep(530);
    return num;
};

const hasNodesNeedingUpdate = (liked, shouldHide) => {
    for (const node of liked) {
        if (shouldHide) {
            if (node.style.display != 'none') return true;
        } else {
            if (node.style.display == 'none') return true;
        }
    }
    return false;
};

let applyToken = 0;
const applyHideState = async (shouldHide) => {
    const token = ++applyToken;
    const liked = getLikedIllusts();
    if (!liked || !hasNodesNeedingUpdate(liked, shouldHide)) {
        if (token === applyToken) loading(false);
        return;
    }

    suppressObserverFor(1000);
    loading(true);
    try {
        const num = shouldHide ? await hideCollectedIllusts(liked) : await showCollectedIllusts(liked);
        if (token !== applyToken) return;
        if (num > 0) {
            Notification(shouldHide ? `已隐藏${num}个已收藏的插画` : `已恢复显示${num}个已收藏的插画`);
        }
    } finally {
        if (token === applyToken) loading(false);
    }
};

const applyHideStateDebounced = debounce(
    () => {
        if (!HIDE_STATUS_REF.value) return;
        applyHideState(true);
    },
    300,
    { maxWait: 1500 }
);

const ARTWORK_LINK_SELECTOR = "a[href*='/artworks/'], a[href*='artworks/']";
const nodeContainsArtworkLink = (node) => {
    if (!(node instanceof Element)) return false;
    if (node.matches(ARTWORK_LINK_SELECTOR)) return true;
    return Boolean(node.querySelector(ARTWORK_LINK_SELECTOR));
};
const shouldHandleMutations = (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type !== 'childList') continue;
        for (const node of mutation.addedNodes) {
            if (nodeContainsArtworkLink(node)) return true;
        }
        for (const node of mutation.removedNodes) {
            if (nodeContainsArtworkLink(node)) return true;
        }
    }
    return false;
};

let suppressObserverUntil = 0;
const suppressObserverFor = (ms) => {
    suppressObserverUntil = Math.max(suppressObserverUntil, Date.now() + ms);
};

const observer = new MutationObserver((mutationsList) => {
    if (!HIDE_STATUS_REF.value) return;
    if (Date.now() < suppressObserverUntil) return;
    if (!shouldHandleMutations(mutationsList)) return;
    applyHideStateDebounced();
});

let isObserving = false;
const ensureObserverActive = () => {
    if (isObserving) return;
    const body = document.body || document.querySelector('body');
    if (!body) return;
    observer.observe(body, {
        attributes: false,
        childList: true,
        subtree: true
    });
    isObserving = true;
};

const HIDE_STATUS_REF = ref(GM_getValue('HIDE_STATUS', false));

onMounted(() => {
    ensureObserverActive();
});
watch(
    () => HIDE_STATUS_REF.value,
    async (HIDE_STATUS) => {
        GM_setValue('HIDE_STATUS', HIDE_STATUS);
        ensureObserverActive();
        if (HIDE_STATUS) {
            applyHideStateDebounced.cancel();
            await applyHideState(true);
        } else {
            applyHideStateDebounced.cancel();
            await applyHideState(false);
        }
    },
    { immediate: true }
);
</script>
