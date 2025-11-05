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
  const code = new URLSearchParams(window.location.search).get("code");
  // alert(code);
  const res: any = await h5GetInfoFile({
    tagNum: tagNum.value,
    code: code
  });
  if (res.code == 1) {
    dataList.value = res.data.qrCodeInfo || [];
  } else {
    alert(res.message);
  }
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

// 是否为视频
function isVideo(fileType) {
  return [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".mpeg"].includes(
    fileType
  );
}
const handleDownload = async item => {
  const fileName = item.fileName;
  console.log(item);
  if (isVideo(item.fileType)) {
    largeDownload(item);
  } else {
    const url = `/api/fileInfo/download/${item.fileKey}`;
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
};
// 大文件下载
const largeDownload = async item => {
  const fileName = item.fileName;
  const url = `/api/api/video/download`;
  let formdata = new FormData();
  formdata.append("fileKey", item.fileKey);

  await fetch(url, { method: "POST", body: formdata })
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
};

// function handleDownload(item) {
//   const fileName = item.fileName;
//   if (item?.fileSize > 5 * 1024 * 1024) {
//     const url = `/api/video/download`;
//     let formdata = new FormData();
//     formdata.append("fileKey", item.fileKey);
//     fetch(url, { body: formdata })
//       .then(res => {
//         if (!res.ok) throw new Error("下载失败");
//         return res.blob();
//       })
//       .then(blob => {
//         const blobUrl = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = blobUrl;
//         a.download = fileName || url.split("/").pop() || "file";
//         a.style.display = "none";
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(blobUrl);
//       })
//       .catch(err => {
//         console.error("下载出错：", err);
//         alert("下载失败，请检查文件链接");
//       });
//   } else {
//     const url = `/api/fileInfo/download/${item.fileKey}`;
//     fetch(url)
//       .then(res => {
//         if (!res.ok) throw new Error("下载失败");
//         return res.blob();
//       })
//       .then(blob => {
//         const blobUrl = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = blobUrl;
//         a.download = fileName || url.split("/").pop() || "file";
//         a.style.display = "none";
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(blobUrl);
//       })
//       .catch(err => {
//         console.error("下载出错：", err);
//         alert("下载失败，请检查文件链接");
//       });
//   }
//   // downloadFile(
//   //   `api/fileInfo/download/${item.fileKey}`,
//   //   item.fileName,
//   //   item.fileSize
//   // );
// }

// 下载方法
function downloadFile(url: string, fileName?: string, fileSize?: string) {
  // fetch(url)
  //   .then(res => {
  //     if (!res.ok) throw new Error("下载失败");
  //     return res.blob();
  //   })
  //   .then(blob => {
  //     const blobUrl = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = blobUrl;
  //     a.download = fileName || url.split("/").pop() || "file";
  //     a.style.display = "none";
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(blobUrl);
  //   })
  //   .catch(err => {
  //     console.error("下载出错：", err);
  //     alert("下载失败，请检查文件链接");
  //   });
  // const fileName = item.fileName;
  // console.log(item);
}

onMounted(() => {
  const env = getScanEnv();
  const enterType = route.query.enterType;
  tagNum.value = route.query.tagNum;

  alert(window.location.href);

  if (enterType === "jinfeng") {
    if (env !== "wecom") {
      alert("请使用企业微信扫码打开此页面");
      window.location.replace("https://work.weixin.qq.com/"); // 可引导用户去企业微信
      return;
    } else {
      // 金风-企业微信用户鉴权
      // const corpId = "你的企业CorpID"; // 企业CorpID
      // const redirectUri = encodeURIComponent(window.location.href);
      // const scope = "snsapi_base"; // 静默授权
      // const state = "STATE";
      // window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
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
</style>
