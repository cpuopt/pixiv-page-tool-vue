<template>
  <div>
    <el-button
      v-show="LocationUNIONTYPE.CollectionUnHide.includes(location)"
      :loading="turnHide_statue"
      class="main-button"
      type="primary"
      plain
      @click="turnHide()"
      >当前类别转为不公开
    </el-button>

    <el-button
      v-show="LocationUNIONTYPE.CollectionHide.includes(location)"
      :loading="turnHide_statue"
      class="main-button"
      type="primary"
      plain
      @click="turnShow()"
      >当前类别转为公开
    </el-button>

    <el-button
      v-show="LocationUNIONTYPE.CollectionUnTaged.includes(location)"
      :loading="false"
      class="main-button"
      type="primary"
      plain
      @click="addTag()"
      >为未分类作品设置Tag
    </el-button>

    <el-button
      v-show="LocationUNIONTYPE.CollectionTaged.includes(location)"
      :loading="false"
      class="main-button"
      type="primary"
      plain
      @click="removeTag()"
      >移除当前分类作品的Tag
    </el-button>
  </div>
</template>

<script setup>
import { LocationTYPE, LocationUNIONTYPE } from "../utils/LocationType.js";

import { ref, watch } from "vue";
import { ElButton } from "element-plus";
import { Eleme } from "@element-plus/icons-vue";
import axios from "axios";
import { addLog } from "../utils/message.js";

const props = defineProps({
  location: String,
  message: Object,
});

const turnHide_statue = ref(false);

class Request {
  static batch = 48;
  static delay = 1600;
  static restrict = Object.freeze({
    private: "private",
    public: "public",
  });
  static rest = Object.freeze({
    show: "show",
    hide: "hide",
  });
  static _bookmarks(uid, tag, offset, limit, rest) {
    return new Promise((resolve, reject) => {
      const url = `https://www.pixiv.net/ajax/user/${uid}/illusts/bookmarks`;
      axios
        .get(url, {
          params: {
            tag: tag,
            offset: offset,
            limit: limit,
            rest: rest,
          },
        })
        .then((response) => {
          setTimeout(() => {
            resolve({
              total: response.data.body.total,
              idList: response.data.body.works.map((work) => work.bookmarkData.id),
            });
          }, this.delay);
        })
        .catch((error) => {
          throw error;
        });
    });
  }

  static _edit_restrict(bookmarkIds, restrict) {
    return new Promise((resolve, reject) => {
      const url = `https://www.pixiv.net/ajax/illusts/bookmarks/edit_restrict`;
      axios
        .post(
          url,
          {
            bookmarkIds: bookmarkIds,
            bookmarkRestrict: restrict,
          },
          {
            headers: {
              "X-Csrf-Token": localStorage.getItem("xzToken"),
            },
          }
        )
        .then((response) => {
          setTimeout(() => {
            resolve();
          }, this.delay);
        });
    });
  }
  static _add_tags(bookmarkIds, tag) {
    return new Promise((resolve, reject) => {
      const url = "https://www.pixiv.net/ajax/illusts/bookmarks/add_tags";
      axios
        .post(
          url,
          {
            bookmarkIds: bookmarkIds,
            tags: [tag],
          },
          {
            headers: {
              "X-Csrf-Token": localStorage.getItem("xzToken"),
            },
          }
        )
        .then((response) => {
          setTimeout(() => {
            resolve();
          }, this.delay);
        });
    });
  }
  static _remove_tags(bookmarkIds, tag) {
    return new Promise((resolve, reject) => {
      const url = "https://www.pixiv.net/ajax/illusts/bookmarks/remove_tags";
      axios
        .post(
          url,
          {
            bookmarkIds: bookmarkIds,
            removeTags: [tag],
          },
          {
            headers: {
              "X-Csrf-Token": localStorage.getItem("xzToken"),
            },
          }
        )
        .then((response) => {
          setTimeout(() => {
            resolve();
          }, this.delay);
        });
    });
  }
  static async getBookmarksByTag(uid, tag, rest) {
    let { total, idList } = await this._bookmarks(uid, tag, 0, this.batch, rest);

    for (let index = 1; index < Math.ceil(total / this.batch); index++) {
      const { total: _, idList: _idList } = await this._bookmarks(
        uid,
        tag,
        this.batch * index,
        this.batch,
        rest
      );
      idList = [...idList, ..._idList];
      addLog(props.message, `获取到${idList.length}个作品`);
    }
    return idList;
  }
  static async setPrivate(idList) {
    while (idList.length > 0) {
      await this._edit_restrict(idList.splice(0, this.batch), this.restrict.private);
      addLog(props.message, `转为不公开，剩余${idList.length}个`);
    }
  }

  static async setPublic(idList) {
    while (idList.length > 0) {
      await this._edit_restrict(idList.splice(0, this.batch), this.restrict.public);
      addLog(props.message, `转为公开，剩余${idList.length}个`);
    }
  }
  static async setTag(idList, tag) {
    while (idList.length > 0) {
      await this._add_tags(idList.splice(0, this.batch), tag);
      addLog(props.message, `设置分类，剩余${idList.length}个`);
    }
  }
  static async removeTag(idList, tag) {
    while (idList.length > 0) {
      await this._remove_tags(idList.splice(0, this.batch), tag);
      addLog(props.message, `移除分类，剩余${idList.length}个`);
    }
  }
}

const turnHide = async () => {
  const activatedTag = document.querySelector("a[status='active'] >div >div >div");

  let showTag;
  let targetTag;
  if (activatedTag != null) {
    showTag = activatedTag.title;
    if (showTag[0] == "#") {
      targetTag = showTag.slice(1);
    } else {
      targetTag = "未分類";
    }
  } else {
    showTag = "全部公开";
    targetTag = "";
  }

  const conf = confirm(`将 ${showTag} 作品转为不公开，确定吗`);

  if (conf) {
    addLog(props.message, `tag='${targetTag}' 作品转为不公开，即将开始`);
    const uid = window.location.pathname.match(/users\/(\d+)\//)[1];
    const idlist = await Request.getBookmarksByTag(uid, targetTag, "show");
    await Request.setPrivate(idlist);
  }
};
const turnShow = async () => {
  const activatedTag = document.querySelector("a[status='active'] >div >div >div");

  let showTag;
  let targetTag;
  if (activatedTag != null) {
    showTag = activatedTag.title;
    if (showTag[0] == "#") {
      targetTag = showTag.slice(1);
    } else {
      targetTag = "未分類";
    }
  } else {
    showTag = "全部公开";
    targetTag = "";
  }

  const conf = confirm(`将 ${showTag} 作品转为公开，确定吗`);
  if (conf) {
    addLog(props.message, `tag='${targetTag}' 作品转为公开，即将开始`);
    const uid = window.location.pathname.match(/users\/(\d+)\//)[1];
    const idlist = await Request.getBookmarksByTag(uid, targetTag, "hide");
    await Request.setPublic(idlist);
  }
};
const addTag = async () => {
  const hide_or_show = document.querySelector(
    "div> div > div > a[href*='%E6%9C%AA%E5%88%86%E9%A1%9E']"
  );
  let rest;
  if (hide_or_show.parentElement.children.item(0).tagName == "A") {
    // 不公开
    rest = Request.rest.hide;
  } else {
    // 公开
    rest = Request.rest.show;
  }

  const conf = prompt(`输入要为 未分类 作品添加的Tag？`);
  if (conf) {
    addLog(props.message, `为 未分类 作品添加${conf} Tag，即将开始`);
    const uid = window.location.pathname.match(/users\/(\d+)\//)[1];
    const idlist = await Request.getBookmarksByTag(uid, "未分類", rest);
    await Request.setTag(idlist, conf);
  }
};
const removeTag = async () => {
  const activatedTag = document.querySelector("a[status='active'] >div >div >div");

  let targetTag;
  if (activatedTag != null) {
    targetTag = activatedTag.title.slice(1);
  }

  const hide_or_show = document.querySelector(
    "div> div > div > a[href*='/bookmarks/artworks/']"
  );
  let rest;
  if (hide_or_show.parentElement.children.item(0).tagName == "A") {
    // 不公开
    rest = Request.rest.hide;
  } else {
    // 公开
    rest = Request.rest.show;
  }
  const conf = confirm(`清除tag为 ${targetTag} 的作品的tag，确定吗`);
  if (conf) {
    addLog(props.message, `清除tag为 ${targetTag} 的作品的tag，即将开始`);
    const uid = window.location.pathname.match(/users\/(\d+)\//)[1];
    const idlist = await Request.getBookmarksByTag(uid, targetTag, rest);
    await Request.removeTag(idlist, targetTag);
  }
};
</script>
