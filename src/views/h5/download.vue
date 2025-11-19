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

    <!-- 下载进度弹窗 -->
    <div v-if="downloading" class="download-overlay">
      <div class="progress-box">
        <p class="file-name">{{ currentFileName }}</p>
        <div class="progress-bar">
          <div class="progress-inner" :style="{ width: progress + '%' }" />
        </div>
        <p class="progress-text">{{ progress.toFixed(1) }}%</p>
      </div>
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

// 下载进度状态
const downloading = ref(false);
const progress = ref(0);
const currentFileName = ref("");

async function getListData() {
  const code = new URLSearchParams(window.location.search).get("code");
  const res: any = await h5GetInfoFile({
    tagNum: tagNum.value,
    code: code
  });
  dataList.value = res.data.qrCodeInfo || [];
}

function getScanEnv() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("wxwork")) return "wecom";
  else if (ua.includes("micromessenger")) return "wechat";
  else return "browser";
}

function isVideo(fileType) {
  return [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".mpeg"].includes(
    fileType
  );
}

// handleDownload 改成 fetch + ReadableStream
const handleDownload = async item => {
  if (!item?.fileKey) return alert("文件信息异常");
  currentFileName.value = item.fileName;
  downloading.value = true;
  progress.value = 0;

  try {
    let url = isVideo(item.fileType)
      ? "/api/api/video/download"
      : `/api/fileInfo/download/${item.fileKey}`;

    let options = {};
    if (isVideo(item.fileType)) {
      const formData = new FormData();
      formData.append("fileKey", item.fileKey);
      options = { method: "POST", body: formData };
    }

    const response = await fetch(url, options);

    if (!response.ok) throw new Error("下载失败");

    const contentLength = +response.headers.get("Content-Length") || 0;
    const reader = response.body?.getReader();
    const chunks = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;

      if (contentLength) {
        progress.value = Math.min((receivedLength / contentLength) * 100, 100);
      } else {
        // 没 Content-Length 时模拟进度
        progress.value = Math.min(progress.value + 2, 95);
      }
    }

    // 拼接 blob 并触发下载
    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = item.fileName || "file";
    a.click();
    URL.revokeObjectURL(blobUrl);

    progress.value = 100;
    setTimeout(() => (downloading.value = false), 500);
  } catch (err) {
    console.error("下载出错:", err);
    alert("下载失败，请检查网络或文件链接");
    downloading.value = false;
  }
};

onMounted(() => {
  const env = getScanEnv();
  const enterType = route.query.enterType;
  tagNum.value = route.query.tagNum;

  if (enterType === "jinfeng") {
    if (env !== "wecom") {
      alert("请使用企业微信扫码打开此页面");
      // 用企业微信协议跳转
      const targetUrl = encodeURIComponent(window.location.href);
      window.location.href = `wxwork://jump?url=${targetUrl}`;
      return;
      // window.location.replace("https://work.weixin.qq.com/");
      // return;
    } else {
      // 金风-企业微信用户鉴权
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        const corpId = "wx124d29551bcf4590"; // 企业CorpID
        const redirectUri = encodeURIComponent(window.location.href);
        const scope = "snsapi_base"; // 静默授权
        const state = "STATE";
        window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
      }
      // 已有code，不再跳转
    }
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

/* 下载进度遮罩层 */
.download-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  pointer-events: all; /* 阻止点击页面其他区域 */
  background: rgb(0 0 0 / 40%);

  .progress-box {
    width: 80%;
    max-width: 320px;
    padding: 20px;
    text-align: center;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 10%);

    .file-name {
      margin-bottom: 10px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      word-break: break-all;
    }

    .progress-bar {
      width: 100%;
      height: 10px;
      overflow: hidden;
      background: #eee;
      border-radius: 5px;

      .progress-inner {
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #4facfe, #00f2fe);
        transition: width 0.2s ease;
      }
    }

    .progress-text {
      margin-top: 10px;
      font-size: 14px;
      color: #333;
    }
  }
}
</style>
