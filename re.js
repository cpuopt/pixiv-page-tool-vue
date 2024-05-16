// ==UserScript==
// @name         PixivPagetool
// @name:zh-CN   Pixiv网页辅助
// @namespace    http://tampermonkey.net/
// @version      0.3.5
// @description
// @description:zh-cn
// @author       cpufan
// @match        https://www.pixiv.net/*
// @homepageURL  https://github.com/cpuopt/PixivPagetool/blob/main/hideliked.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @downloadURL  https://github.com/cpuopt/PixivPagetool/raw/main/hideliked.js
// @updateURL    https://github.com/cpuopt/PixivPagetool/raw/main/hideliked.js
// @grant        GM_setValue
// @grant        GM_getValue

// ==/UserScript==

(function () {
    'use strict';
    var mob;
    var pluginCanvas;
    var collect;
    var addclf;
    var topvt;
    var addcollect;


    // pushState
    var _wr = function (type) {
        var orig = history[type];
        return function () {
            var rv = orig.apply(this, arguments);
            var e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return rv;
        };
    };
    history.pushState = _wr('pushState');

    // pushStateListener
    window.addEventListener('pushState', function (e) {
        console.warn(`href changed to ${window.location.href}`);
        mob.reset()

        addclf = new Add2Classification()
        topvt = new ToPrivate()
        addcollect = new AddCollect()



    });

    window.onload = function () {
        //菜单初始化
        pluginCanvas = new Canvas()
        collect = new HideCollect()
        addclf = new Add2Classification()
        topvt = new ToPrivate()
        addcollect = new AddCollect()

        mob = new MutationOb()

        if (GM_getValue('CanvasState', 'S') == 'H') {
            unsafeWindow.hideCanvas()
        }
        if (GM_getValue('HS', 'S') == 'H') {
            collect.hide()
        }


    }
    // // 修改地址栏url方法hook
    // hookpushState()

    // function hookpushState() {
    //     var _pushState = window.history.pushState;
    //     window.history.pushState = function () {
    //         mob.reset()
    //         if (window.dispatchEvent) {
    //             window.dispatchEvent(changeHref);
    //         } else {
    //             window.fireEvent(changeHref);
    //         }
    //         return _pushState.apply(this, arguments);
    //     }
    // }

    /**
     * MutationObserver
     */
    class MutationOb {
        observer;
        constructor() {

            console.log("MutationObserver init")

            this.observer = new MutationObserver(function () {
                //MutationObserver回调函数
                if (GM_getValue('HS', 'S') == 'H') {
                    try {
                        collect.hide()
                        console.log('MutationObserver隐藏成功')
                    }
                    catch (err) {
                        console.log('MutationObserver作品未加载')
                    }
                }
            });
            this.reset()
        }

        /**
        * 依据数据库[HS]启动或关闭MutationObserver
        */
        reset() {

            this.observer.disconnect()

            if (GM_getValue('HS', 'S') == 'H') {

                let url = window.location.href
                var style
                if (url.startsWith('https://www.pixiv.net/tags/')) {
                    style = `section.sc-jgyytr-0`
                }
                else if (url.startsWith('https://www.pixiv.net/users/')) {
                    style = `section.sc-jgyytr-0`
                }
                else if (url.startsWith('https://www.pixiv.net/bookmark_new_illust.php')) {
                    style = `div.sc-s8zj3z-4`
                }
                else if (url.startsWith('https://www.pixiv.net/')) {
                    style = `div.sc-1kr69jw-3`
                }

                let illustsDivNode;
                do {
                    illustsDivNode = document.querySelector(style)
                    console.debug(`${style}未加载`)
                }
                while (illustsDivNode == null)

                this.observer.observe(illustsDivNode, { attributes: false, childList: true, subtree: true });
                collect.setButtonState(true)

            }
            else if (GM_getValue('HS', 'S') == 'S') {
                collect.setButtonState(false)
            }
        }

    }
    /**
     * 添加收藏标签
     */
    class Add2Classification {
        button;
        constructor() {
            this.button = document.createElement('button')
            this.button.className = 'plugin-button-blue'
            this.button.id = 'AddclfButton'
            this.button.innerText = '添加收藏标签'
            this.button.setAttribute('onclick', `window.addClassification()`)

            const canvas = document.querySelector('#plugin-canvas')
            if (/https:\/\/www.pixiv.net\/users\/\d+\/bookmarks\/artworks\/%E6%9C%AA%E5%88%86%E9%A1%9E/.test(window.location.href)) {
                if (!document.querySelector("#AddclfButton"))
                    canvas.appendChild(this.button)
            }
            else {
                let button = document.querySelector("#AddclfButton")
                if (button) {
                    button.parentElement.removeChild(button)
                }
            }
        }
        add2cls() {

            var tag = prompt("要给未分类的收藏打上什么标签呢？", "")
            var conf = confirm(`给未分类作品添加 ${tag} 标签，确定吗`)
            if (tag && conf) {
                // 单击 管理收藏
                function EditBookmarks() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//span[contains(text(),'管理收藏')]", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }
                // 单击 全选
                function SelectAll() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//div[contains(text(),'全选')]", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }
                // 单击 添加收藏标签
                function ClickAdd() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//div[contains(text(),'添加收藏标签')]", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }
                /**
                 * 已有tag和新建tag的处理
                 * @returns
                 */
                function AddBookmarkTags() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            let tag_button = document.evaluate(`//label//div[text()='#${tag}']`, document.body, null, 9, null).singleNodeValue
                            if (tag_button) {
                                tag_button.click()
                            }
                            else {

                            }
                            resolve();
                        }, 1000)
                    })
                }

                function TagSave() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//div[text()='保存']", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }
                function changePage() {
                    return new Promise(resolve => {
                        setTimeout(() => {

                            let pageList = document.evaluate("//nav//span/text()", document.body, null, 7, null)
                            let nextPage
                            let nowPage = document.evaluate("//nav//button/span/text()", document.body, null, 9, null).singleNodeValue.data
                            if (pageList.snapshotItem(4) == null && pageList.snapshotItem(3) && pageList.snapshotItem(3).data == '4') {
                                nextPage = '3'
                            }
                            else if (nowPage == '3') {
                                nextPage = '2'

                            }
                            else {
                                if (nowPage == '1') {
                                    nextPage = '2'
                                } else {
                                    nextPage = '1'
                                }
                            }
                            if (pageList.snapshotItem(0) && !pageList.snapshotItem(1)) {
                                window.location.reload();
                            }



                            document.evaluate(`//nav//span[text()='${nextPage}']`, document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });

                }

                async function run_Add() {

                    while (1) {
                        await EditBookmarks()
                        await SelectAll()
                        await ClickAdd()
                        await AddBookmarkTags()
                        await TagSave()
                        await changePage()
                    }
                }
                run_Add()

            } else {
                alert("操作已取消")
            }
        }

    }
    /**
     * 修改收藏类型为不公开
     */
    class ToPrivate {
        button;
        constructor() {
            this.button = document.createElement('button')
            this.button.className = 'plugin-button-blue'
            this.button.id = 'ToPrivateButton'
            this.button.innerText = '转为不公开'
            this.button.setAttribute('onclick', `window.toPrivate()`)

            const canvas = document.querySelector('#plugin-canvas')
            if (/https:\/\/www.pixiv.net\/users\/\d+\/bookmarks\/artworks\/.+/.test(window.location.href) && (window.location.href.indexOf("?") == -1)) {
                if (!document.querySelector("#ToPrivateButton"))
                    canvas.appendChild(this.button)
            }
            else {
                let button = document.querySelector("#ToPrivateButton")
                if (button) {
                    button.parentElement.removeChild(button)
                }
            }
        }

        toprivate() {
            let activeTag = document.evaluate("//a[@status='active']//div[@title=text()]/text()", document.body, null, 9, null).singleNodeValue.data

            var conf = confirm(`把tag为「${activeTag}」作品转为不公开，确定吗`)
            if (conf) {
                // 单击 管理收藏
                function EditBookmarks() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//span[text()='管理收藏']", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }
                // 单击 全选
                function SelectAll() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//div[text()='全选']", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }
                // 单击 设为不公开
                function setPrivate() {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            document.evaluate("//div[text()='设为不公开']", document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });
                }

                function changePage() {
                    return new Promise(resolve => {
                        setTimeout(() => {

                            let pageList = document.evaluate("//nav//span/text()", document.body, null, 7, null)
                            let nextPage
                            let nowPage = document.evaluate("//nav//button/span/text()", document.body, null, 9, null).singleNodeValue.data
                            if (pageList.snapshotItem(4) == null && pageList.snapshotItem(3) && pageList.snapshotItem(3).data == '4') {
                                nextPage = '3'
                            }
                            else if (nowPage == '3') {
                                nextPage = '2'

                            }
                            else {
                                if (nowPage == '1') {
                                    nextPage = '2'
                                } else {
                                    nextPage = '1'
                                }
                            }
                            if (pageList.snapshotItem(0) && !pageList.snapshotItem(1)) {
                                window.location.reload();
                            }



                            document.evaluate(`//nav//span[text()='${nextPage}']`, document.body, null, 9, null).singleNodeValue.click();
                            resolve();
                        }, 1000);
                    });

                }
                async function run_Change() {

                    while (1) {
                        await EditBookmarks()
                        await SelectAll()
                        await setPrivate()
                        await changePage()
                    }
                }
                run_Change()



            } else {
                alert("操作已取消")
            }
        }
    }
    /**
    * @class 收藏
    * @classdesc 已收藏作品的隐藏显示和按钮状态
    */
    class HideCollect {
        button;
        constructor() {
            this.button = document.createElement('button')
            this.button.className = 'plugin-button-blue'
            this.button.id = 'LikeCentralButton'
            this.button.innerText = '隐藏已收藏作品'
            this.button.setAttribute('onclick', `window.hideLikedIllusts()`)

            const canvas = document.querySelector('#plugin-canvas')
            canvas.appendChild(this.button)


        }
        /**
        * 设置收藏作品按钮状态
        * @param {*boolean} hide
        */
        setButtonState(hide) {
            if (hide == true) {
                // 隐藏已收藏作品
                this.button.innerText = '显示已收藏作品'
                this.button.setAttribute('onclick', `window.unhideLikedIllusts()`)
                this.button.className = 'plugin-button-white'
            }
            else if (hide == false) {
                // 恢复显示
                this.button.innerText = '隐藏已收藏作品'
                this.button.setAttribute('onclick', `window.hideLikedIllusts()`)
                this.button.className = 'plugin-button-blue'
            }
        }


        /**
         * 隐藏已收藏作品
         */
        hide() {
            mob.observer.disconnect();
            let liked = document.evaluate('//*[local-name() = "svg" and @class="sc-j89e3c-1 bXjFLc"]/../../../../../../..', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)



            for (var i = 0; i < liked.snapshotLength; i++) {

                let nodes = liked.snapshotItem(i)
                nodes.style.display = 'none'
                //nodes.style.transition = 'opacity 1s';
                //nodes.style.opacity = '0'
            }
            let text = `已隐藏收藏过的${liked.snapshotLength}个作品`
            if (document.getElementById('shou_num') == null) {
                let alt = document.createElement("div")
                alt.id = 'shou_num'
                alt.style.padding = '20px'
                alt.innerText = text
                liked.snapshotItem(0).parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector("div:nth-child(2)").append(alt)
            }
            else {
                document.getElementById('shou_num').innerText = text
            }
            this.setButtonState(true)
            mob.reset();

        }
        /**
         * 恢复显示已收藏作品
         */
        show() {
            let liked = document.evaluate('//*[local-name() = "svg" and @class="sc-j89e3c-1 bXjFLc"]/../../../../../../..', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)


            for (var i = 0; i < liked.snapshotLength; i++) {

                let nodes = liked.snapshotItem(i)
                nodes.style.display = 'block'
                //nodes.style.opacity = '1'
            }
            if (document.getElementById('shou_num') != null) {
                let alt = document.getElementById('shou_num')
                alt.parentElement.removeChild(alt)
            }
            this.setButtonState(false)

        }

    }

    /**
     * 收藏本页显示的所有作品
     */
    class AddCollect {
        button;
        constructor() {
            this.button = document.createElement('button')
            this.button.className = 'plugin-button-blue'
            this.button.id = 'addCollectButton'
            this.button.innerText = '收藏本页所有作品'
            this.button.setAttribute('onclick', `window.addCollect()`)

            const canvas = document.querySelector('#plugin-canvas')
            if (/https:\/\/www.pixiv.net\/bookmark_new_illust.php/.test(window.location.href)) {
                if (!document.querySelector("#addCollectButton")) {
                    canvas.appendChild(this.button)
                }
            }
            else {
                let button = document.querySelector("#addCollectButton")
                if (button) {
                    button.parentElement.removeChild(button)
                }
            }
        }
        add2Collect() {

            function addc(addButton) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        addButton.click()
                        resolve();
                    }, 200);
                });
            }
            async function run_add() {
                let uncollects = document.evaluate(`//button[@class='sc-kgq5hw-0 fgVkZi']/*[name()="svg"][contains(@class,'sc-j89e3c-1 dxYRhf') or contains(@class,'sc-j89e3c-1 fYcrPo')]`, document.body, null, 7, null)
                for (let i = 0; i < uncollects.snapshotLength; i++) {
                    await addc(uncollects.snapshotItem(i).parentElement)
                }

            }
            run_add()

        }
    }
    /**
     * 插件菜单类
     */
    class Canvas {

        constructor() {
            var styles = document.createElement('style');
            document.head.appendChild(styles);
            styles.innerHTML = `
#plugin-canvas {transition: right 0.6s;position: fixed;background-color: #ffffff;right: 0;top: 30%;height: 300px;border-radius: 10px;border-left: solid 2px rgb(162, 218, 255)}
.plugin-button-blue {display: block;color: rgb(255, 255, 255);background-color: rgb(0, 150, 250);font-size: 14px;font-weight: bold;margin: 16px;padding-left: 20px;padding-right: 20px;height: 42px;border: none;border-radius: 100000px;transition: background-color 0.6s;}
.plugin-button-white {display: block;color: rgb(71,71,71);background-color: rgb(245,245,245);font-size: 14px;font-weight: bold;margin: 16px;padding-left: 20px;padding-right: 20px;height: 42px;border: none;border-radius: 100000px;transition: background-color 0.6s;}
.plugin-button-blue:hover {background-color: rgb(0,114,240);cursor: pointer;}
.plugin-button-white:hover {background-color: rgb(235,235,235);cursor: pointer;}
.hideCanvas {padding: 0;height: 100px;width: 15px;position: absolute;left: -15px;top: 100px;border: solid 2px rgb(162, 218, 255);background-color: rgb(255, 255, 255);border-radius: 10px 0px 0px 10px;transition: background-color 0.6s;cursor: pointer;}
.hideCanvas:hover{background-color: rgb(162, 218, 255);}
.showCanvas {padding: 0;height: 100px;width: 15px;position: absolute;left: -15px;top: 100px;border: solid 2px rgb(162, 218, 255);background-color: rgb(255, 255, 255);border-radius: 10px 0px 0px 10px;transition: background-color 0.6s;cursor: pointer;}
.showCanvas:hover{background-color: rgb(162, 218, 255);}
        `
            let canvas = document.createElement('div')
            canvas.id = 'plugin-canvas'

            let canvasButton = document.createElement('button')
            canvas.appendChild(canvasButton)
            canvasButton.id = 'canvasButton'
            canvasButton.setAttribute('onclick', `window.hideCanvas()`)
            canvasButton.className = 'hideCanvas'
            canvasButton.innerHTML = '<svg style="margin-left:-2px" width="16" height="16" fill="rgb(0,150,250)" class="bi bi-caret-right-fill" viewBox="0 0 16 16"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>'

            document.body.appendChild(canvas)

        }
        /**
         * 显示插件菜单
         */
        show() {
            document.querySelector('#plugin-canvas').style.right = '0px'

            document.querySelector('#canvasButton').className = 'hideCanvas'
            document.querySelector('#canvasButton').innerHTML = `<svg style="margin-left:-2px" width="16" height="16" fill="rgb(0,150,250)" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
        <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
      </svg>`
            document.querySelector('#canvasButton').setAttribute('onclick', `window.hideCanvas()`)

        }
        /**
         * 隐藏插件菜单
         */
        hide() {
            document.querySelector('#plugin-canvas').style.right = '-171.6px'

            document.querySelector('#canvasButton').className = 'showCanvas'
            document.querySelector('#canvasButton').innerHTML = `<svg style="margin-left:-2px" width="16" height="16" fill="rgb(0,150,250)" class="bi bi-caret-left-fill" viewBox="0 0 16 16">
            <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/>
          </svg>`
            document.querySelector('#canvasButton').setAttribute('onclick', `window.showCanvas()`)

        }

    }
    // 显示插件菜单
    unsafeWindow.showCanvas = function () {
        pluginCanvas.show()
        GM_setValue('CanvasState', 'S')
    }
    // 隐藏插件菜单
    unsafeWindow.hideCanvas = function () {
        pluginCanvas.hide()
        GM_setValue('CanvasState', 'H')
    }
    // 隐藏已收藏作品
    unsafeWindow.hideLikedIllusts = function () {
        collect.hide()
        GM_setValue('HS', 'H')
        mob.reset()
    }
    // 恢复显示已收藏作品
    unsafeWindow.unhideLikedIllusts = function () {
        collect.show()
        GM_setValue('HS', 'S')
        mob.reset()
    }
    // 未分类收藏添加标签
    unsafeWindow.addClassification = function () {
        addclf.add2cls()
    }
    // 转为不公开
    unsafeWindow.toPrivate = function () {
        topvt.toprivate()
    }
    // 收藏本页所有作品
    unsafeWindow.addCollect = function () {
        addcollect.add2Collect()
    }



})();