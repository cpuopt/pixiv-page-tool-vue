<template>
    <div v-show="active">
        <my-n-switch v-model:value="enabled" checked-text="投稿时间已显示" unchecked-text="显示投稿时间" />
    </div>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { GM_getValue, GM_setValue } from '$';
import { debounce } from 'lodash';
import MyNSwitch from './MyNSwitch.vue';
import { removeIllustUploadTimes, updateIllustUploadTimes } from '../utils/IllustUploadTime';

const props = defineProps({ active: Boolean });
const enabled = ref(GM_getValue('show_illust_upload_time', false));
const update = debounce(updateIllustUploadTimes, 100, { maxWait: 500 });
const artworkSelector = 'a[href*="/artworks/"]';
const containsArtwork = (node) => node instanceof Element && (node.matches(artworkSelector) || Boolean(node.querySelector(artworkSelector)));
const observer = new MutationObserver((mutations) => {
    const hasChanges = mutations.some((mutation) => {
        if (mutation.type === 'attributes') {
            return mutation.target.matches(artworkSelector) || Boolean(mutation.target.closest(artworkSelector));
        }
        return [...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
            containsArtwork(node) || (node instanceof Element && (node.matches('img') || Boolean(node.querySelector('img'))))
        );
    });
    if (hasChanges) update();
});

watch([enabled, () => props.active], ([showTime, active]) => {
    GM_setValue('show_illust_upload_time', showTime);
    observer.disconnect();
    update.cancel();
    if (showTime && active) {
        updateIllustUploadTimes();
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'srcset', 'data-src', 'href']
        });
    } else {
        removeIllustUploadTimes();
    }
}, { immediate: true });

onBeforeUnmount(() => {
    observer.disconnect();
    update.cancel();
    removeIllustUploadTimes();
});
</script>

<style>
.pixiv-page-tool-upload-time {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
    color: inherit;
    opacity: 0.7;
}
</style>
