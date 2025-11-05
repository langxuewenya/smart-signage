<template>
  <el-dialog v-model="dialogVisible" fullscreen :show-close="false">
    <template #header>
      <div class="top">
        <h3>{{ row.name }} 资料上传</h3>
        <div>
          <el-button type="primary" :disabled="loading" @click="handleLock"
            >锁定并返回</el-button
          >
          <el-button :disabled="loading" @click="handleBack">返回</el-button>
        </div>
      </div>
    </template>
    <div v-loading="loading" :element-loading-text="loadingText">
      <SmartUploader
        :userId="userId"
        accept="image/*,video/*,application/pdf"
        @handleUploadSuccess="handleUploadSuccess"
      />
      <div v-if="dataList.length" class="card">
        <div v-for="item in dataList" :key="item.name" class="device-item">
          <FileItem
            :id="item.id"
            :name="item.fileName"
            :type="item.fileType"
            :hasRename="false"
            :hasDownload="true"
            @handleDownload="handleDownload(item)"
            @handleDelete="handleDelete(item)"
          />
        </div>
      </div>
      <el-empty v-else description="暂无数据" style="height: 80vh" />
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import FileItem from "../components/file-item.vue";
import { ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import { getDatumList, fileUploadSave, fileUploadDelete } from "@/api/common";
import { message } from "@/utils/message";
import SmartUploader from "../components/smart-uploader.vue";

const emit = defineEmits(["handleUpdate"]);

const loading = ref(false);
const loadingText = ref("");
const dialogVisible = ref(false);
const row = ref();
const dataList = ref([]);
const fileList = ref([]);
const fileKeys = ref([]);
const userId = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? ""
);

const getListData = async () => {
  loading.value = true;
  const params = {
    id: row.value.id
  };
  const res: any = await getDatumList(params);
  loading.value = false;
  dataList.value = res.data || [];
};

const handleDelete = item => {
  ElMessageBox.confirm(
    `删除后不可恢复，确认删除该资料？`,
    `删除${item.fileName}`,
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      const params = {
        fileKey: item.fileKey,
        deviceCategoryId: row.value.id
      };
      const res: any = await fileUploadDelete(params);
      if (res.code == 1) {
        message(`删除成功`, { type: "success" });
        getListData();
      }
    })
    .catch(() => {});
};

function handleUploadSuccess(res) {
  // 根据响应数据兼容
  fileKeys.value = Array.isArray(res.data.fileKeys)
    ? res.data.fileKeys
    : [res.data.fileKey];
  saveUploadFile();
}

// 保存资料（上传后即保存，状态为已编辑）
const saveUploadFile = async () => {
  loading.value = true;
  const list = fileKeys.value.map(item => {
    return {
      fileKey: item,
      deviceCategoryId: row.value.id
    };
  });
  const params = {
    fileInfoList: list,
    userId: userId.value,
    type: "已编辑"
  };
  const res: any = await fileUploadSave(params);
  loading.value = false;
  if (res.code === 1) {
    message(`上传成功`, { type: "success" });
    getListData();
  }
};

const handleBack = async () => {
  close();
  emit("handleUpdate");
};

const handleLock = async () => {
  loading.value = true;
  const list = dataList.value.map(item => {
    return {
      fileKey: item.fileKey,
      deviceCategoryId: row.value.id
    };
  });
  const params = {
    fileInfoList: list,
    userId: userId.value,
    type: "已锁定"
  };
  const res: any = await fileUploadSave(params);
  loading.value = false;
  if (res.code === 1) {
    message(`锁定成功`, { type: "success" });
    emit("handleUpdate");
    close();
  }
};

// 是否为视频
function isVideo(fileType) {
  return [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".mpeg"].includes(
    fileType
  );
}
// 资料下载
const handleDownload = async item => {
  const fileName = item.fileName;
  console.log(item);
  // if (item?.fileSize > 5 * 1024 * 1024) {
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
        message("下载失败，请检查文件链接", { type: "error" });
      });
  }
};
// 大文件下载
const largeDownload = async item => {
  const fileName = item.fileName;
  const url = `/api/api/video/download`;
  let formdata = new FormData();
  formdata.append("fileKey", item.fileKey);

  loading.value = true;
  loadingText.value = "下载中...";
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
      message("下载失败，请检查文件链接", { type: "error" });
    });
  loading.value = false;
  loadingText.value = "";
};

const show = item => {
  dataList.value = [];
  fileList.value = [];
  dialogVisible.value = true;
  row.value = item;
  getListData();
};
const close = () => {
  dialogVisible.value = false;
};

defineExpose({
  show,
  close
});
</script>

<style scoped lang="scss">
.top {
  display: flex;
  justify-content: space-between;
}

.card {
  width: 100%;
  height: 100%;
  padding-top: 25px;
  padding-left: 20px;
  overflow-y: auto;

  .device-item {
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 15px;
  }
}
</style>
