<script setup>
import { reactive, ref, watch } from 'vue';
import { unsafeWindow as window } from '$';
import { ArrowLeftBold, ArrowRightBold, Collection, HomeFilled, Paperclip, CollectionTag } from '@element-plus/icons-vue';
import { ElAside, ElButton, ElContainer, ElHeader, ElIcon, ElLink, ElMain, ElScrollbar } from 'element-plus';
import { add2Collect } from './utils/pixivscripts';
import HideCollectedIllust from './components/HideCollectedIllust.vue';
import CollectedIllustManage from './components/CollectedIllustManage.vue';
import { LocationTYPE, LocationUNIONTYPE, check } from './utils/LocationType.js';
import chalk from 'chalk';
import UserDouble from './svg/UserDouble.vue';
import StyleControl from './components/StyleControl.vue';
import { _debounce_findSpecialEl, _debounce_replaceAllImage, _throttle_findSpecialEl, _throttle_replaceAllImage } from './utils/ShowLargerThumbnails.ts';
/**
 * LOCATION 响应式对象 当前路由路径
 */
const LOCATION = ref('');

const MESSAGE = ref(['插件初始化完成', '-----------']);
/**
 *  LOCATION 更新当前路由路径响应式对象
 */
const checkLocation = () => {
    const location = decodeURI(window.location.pathname + window.location.search);
    LOCATION.value = check(location);
};

/**
 *  HOOK window的pushState方法 意图在路由跳转时获取信息
 */
const _wr = function (type) {
    const orig = history[type];
    return function () {
        const rv = orig.apply(this, arguments);
        const e = new Event(type);
        e.arguments = arguments;
        window.dispatchEvent(e);
        return rv;
    };
};
history.pushState = _wr('pushState');
window.addEventListener('pushState', function (e) {
    checkLocation();
});

/**
 *  LOCATION 侦听器
 */
watch(LOCATION, (NEW_LOCATION, OLD_LOCATION) => {
    console.debug(chalk.blueBright.bgGreenBright(`${OLD_LOCATION}`, `-->`, `${NEW_LOCATION}`));
    if (NEW_LOCATION != OLD_LOCATION) {
    }
});

const show_panel_status = ref(false);

const pluginPanel = ref();
const show_panel_status_handler = (status) => {
    show_panel_status.value = status;
};
const switch_panel_show = (show_or_not) => {
    if (show_or_not) {
        pluginPanel.value.style = 'right: 0;';
    } else {
        pluginPanel.value.style = '';
    }
};
watch(show_panel_status, (new_value, old_value) => {
    if (!old_value && new_value) {
        switch_panel_show(true);
    } else if (old_value && !new_value) {
        switch_panel_show(false);
    }
});

/**
 * @description 返回元素最接近body的父节点
 * @param {*} dom
 */
function findDeep2ndParentNode(dom) {
    if (dom && dom.parentNode && dom.parentNode.tagName != 'BODY') {
        return findDeep2ndParentNode(dom.parentNode);
    } else {
        return dom;
    }
}
const bodyclickEvent = (e) => {
    if (['DIV', 'SECTION', 'UL', 'ASIDE', 'H2'].includes(e.target.tagName.toUpperCase()) && !e.target.classList.contains('bTtACY') && !/pixiv-page-tool/.test(findDeep2ndParentNode(e.target).id))
        show_panel_status.value = false;
};

if (!document.body._isClickHandlerAdded) {
    document.body.addEventListener('click', bodyclickEvent, false);
    document.body._isClickHandlerAdded = true;
}

class PixivNavigation {
    static toHome() {
        window.location.href = 'https://www.pixiv.net/';
    }
    static toBookmark() {
        window.location.href = 'https://www.pixiv.net/bookmark.php';
    }
    static toSubscription() {
        window.location.href = 'https://www.pixiv.net/bookmark_new_illust.php';
    }
}
checkLocation();
function updateToken() {
    const script = document.querySelector('#__NEXT_DATA__');
    if (script) {
        const match = (script.textContent || '').match(/token\\":\\"(\w*)?\\/);
        if (match && match[1] && match[1].length === 32) {
            localStorage.setItem('xzToken', match[1]);
        }
    }
}
window.onload = () => {
    checkLocation();
    updateToken();
    // _debounce_findSpecialEl()
    // _debounce_replaceAllImage()
    _throttle_findSpecialEl();
    _throttle_replaceAllImage();
    const observer = new MutationObserver(async (mutationsList, observer) => {
        // _debounce_findSpecialEl();
        // _debounce_replaceAllImage()
        _throttle_findSpecialEl();
        _throttle_replaceAllImage();
    });
    observer.observe(document.body, {
        childList: true, // 监听子节点的增删
        subtree: true, // 可选：监听后代节点
        attributes: false, // 可选
        characterData: false // 可选
    });
};
</script>

<template id="123">
    <div class="plugin-panel" ref="pluginPanel" @mouseenter="show_panel_status_handler(true)">
        <div class="hover-button" @click="show_panel_status = !show_panel_status">
            <el-icon style="color: #ffffff; width: 20px; width: 100%">
                <ArrowLeftBold v-show="!show_panel_status" />
                <ArrowRightBold v-show="show_panel_status" />
            </el-icon>
        </div>

        <div style="display: flex; width: 100; height: 100%">
            <el-container>
                <el-header height="30px" class="panel-header"><el-link underline="never" class="header-text">Pixiv-Page-Tool</el-link></el-header>
                <el-container>
                    <el-aside class="panel-aside">
                        <el-button v-show="LOCATION != LocationTYPE.Mainpage" type="primary" plain class="aside-icon-button" @click="PixivNavigation.toHome()">
                            <el-icon size="20" color="#FFFFFF">
                                <HomeFilled />
                            </el-icon>
                        </el-button>

                        <el-button v-show="LOCATION == LocationTYPE.Mainpage" type="primary" plain class="aside-icon-button-activated">
                            <el-icon size="20" color="#FFFFFF">
                                <HomeFilled />
                            </el-icon>
                        </el-button>

                        <el-button v-show="!LocationUNIONTYPE.Collection.includes(LOCATION)" type="primary" plain class="aside-icon-button" @click="PixivNavigation.toBookmark()">
                            <el-icon size="20" color="#FFFFFF">
                                <Collection />
                            </el-icon>
                        </el-button>

                        <el-button v-show="LocationUNIONTYPE.Collection.includes(LOCATION)" type="primary" plain class="aside-icon-button-activated">
                            <el-icon size="20" color="#FFFFFF">
                                <Collection />
                            </el-icon>
                        </el-button>

                        <el-button v-show="LOCATION == LocationTYPE.NewIllust || LOCATION == LocationTYPE.NewIllustR18" type="primary" plain class="aside-icon-button-activated">
                            <el-icon size="20" color="#FFFFFF">
                                <UserDouble />
                            </el-icon>
                        </el-button>

                        <el-button
                            v-show="LOCATION != LocationTYPE.NewIllust && LOCATION != LocationTYPE.NewIllustR18"
                            type="primary"
                            plain
                            class="aside-icon-button"
                            @click="PixivNavigation.toSubscription()"
                        >
                            <el-icon size="20" color="#FFFFFF">
                                <UserDouble />
                            </el-icon>
                        </el-button>
                    </el-aside>
                    <el-main class="panel-main">
                        <div class="main-button-group">
                            <el-button v-show="LocationUNIONTYPE.NewIllust.includes(LOCATION)" class="main-button" type="success" plain @click="add2Collect()">收藏本页所有作品</el-button>
                            <HideCollectedIllust v-if="LocationUNIONTYPE.NewIllust.includes(LOCATION) || LocationUNIONTYPE.Search.includes(LOCATION) || LocationUNIONTYPE.Users.includes(LOCATION)" />
                            <CollectedIllustManage v-if="LocationUNIONTYPE.Collection.includes(LOCATION)" :location="LOCATION" :message="MESSAGE" />
                            <StyleControl />
                        </div>
                        <div class="main-message">
                            <el-scrollbar>
                                <div v-for="msg in MESSAGE" style="font-size: small">
                                    {{ msg }}
                                    <br />
                                </div>
                                <div id="msg_end" style="height: 0px; overflow: hidden"></div>
                            </el-scrollbar>
                        </div>
                    </el-main>
                </el-container>
            </el-container>
        </div>
    </div>
</template>
<style lang="scss">
$line-blue: rgb(162, 218, 255);
$ease-time: 0.6s;

.main-button {
    margin: 0 0 0.2rem 0 !important;
    width: 100%;
    border-color: rgb(255, 255, 255) !important;
    background-color: transparent;
    transition: background-color $ease-time;
    color: white;
}

.main-button:hover {
    background-color: $line-blue;
}
</style>
<style lang="scss" scoped>
$line-blue: rgb(162, 218, 255);
$ease-time: 0.6s;

div {
    box-sizing: border-box;
}

.button-tooltip {
    background-color: $line-blue;
}

.plugin-panel {
    width: 200px;
    height: 300px;
    position: fixed;
    right: -200px;
    top: 20vh;
    background-color: rgba(162, 218, 255, 0.6);
    transition: right ease $ease-time;
    border-left: solid 1px $line-blue;
    border-radius: 10px 0 0 10px;
    backdrop-filter: blur(2px);
}

.hover-button {
    width: 15px;
    height: 100px;
    position: absolute;
    top: 100px;
    left: -15px;
    background-color: inherit;
    border-left: solid 1px $line-blue;
    border-radius: 10px 0px 0px 10px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition: background-color $ease-time;
}

.hover-button:hover {
    background-color: $line-blue;
}

.panel-aside {
    padding-inline: 2px;
    width: 32px;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid $line-blue;
}

.panel-header {
    display: flex;
    justify-content: center;
    border-bottom: solid $line-blue 1px;
    margin-bottom: 0.2rem;
}

.header-text {
    color: white;
    transition: color $ease-time;
}

.header-text:hover {
    color: $line-blue;
}

.panel-main {
    padding: 0;
    display: flex;
    flex-direction: column;
}

.main-button-group {
    padding-inline: 0.2rem;
    display: flex;
    flex-direction: column;
}

.main-message {
    margin-top: auto;
    height: 5rem;
    padding: 0.2rem;
    display: flex;
    flex-direction: column;
}

.aside-icon-button {
    margin: 0;
    width: 100%;
    height: 28px;
    padding: 2px;
    border-color: rgb(255, 255, 255);
    background-color: transparent;
    margin-bottom: 0.2rem;
    transition: background-color $ease-time;
}

.aside-icon-button:hover {
    background-color: $line-blue;
}

.aside-icon-button-activated {
    margin: 0;
    width: 100%;
    height: 28px;
    padding: 2px;
    border-color: rgb(255, 255, 255);
    margin-bottom: 0.2rem;
    background-color: $line-blue;
    cursor: no-drop;
}
</style>
