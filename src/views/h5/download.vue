<template>
  <div class="datum-download">
    <div class="device-id">
      <h1>{{ tagNum }}</h1>
    </div>
    <div class="datum-list">
      <template v-for="item in dataList" :key="item.fileName">
        <H5DatumItem :datum="item" @handleDownload="handleDownload" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import H5DatumItem from "../components/h5-datum-item.vue";
import { h5GetInfoFile } from "@/api/common";

const route = useRoute();
const tagNum = ref();
const dataList = ref([]);
async function getListData() {
  const res: any = await h5GetInfoFile({
    tagNum: tagNum.value
  });
  dataList.value = res.data.qrCodeInfo || [];
}

// 判断入口
function getScanEnv() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("wxwork")) {
    return "wecom"; // 企业微信
  } else if (ua.includes("micromessenger")) {
    return "wechat"; // 普通微信
  } else {
    return "browser";
  }
}

function handleDownload(item) {
  downloadFile(`api/fileInfo/download/${item.fileKey}`, item.fileName);
}

// 下载方法
function downloadFile(url: string, fileName?: string) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("下载失败");
      return res.blob();
    })
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || url.split("/").pop() || "file";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error("下载出错：", err);
      alert("下载失败，请检查文件链接");
    });
}

onMounted(() => {
  const env = getScanEnv();
  const enterType = route.query.enterType;
  tagNum.value = route.query.tagNum;

  if (enterType === "jinfeng" && env !== "wecom") {
    alert("请使用企业微信扫码打开此页面");
    window.location.replace("https://work.weixin.qq.com/"); // 可引导用户去企业微信
  }

  getListData();
});
</script>

<style scoped lang="scss">
.datum-download {
  display: flex;
  flex-direction: column;

  .device-id {
    display: inline-block;
    margin: 20px;
    text-align: center;
  }

  .datum-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 10px;
  }
}
</style>
