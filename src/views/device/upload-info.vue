<template>
  <el-dialog
    v-model="dialogVisible"
    v-loading="loading"
    fullscreen
    :show-close="false"
  >
    <template #header>
      <div class="top">
        <h3>{{ row.name }} 资料上传</h3>
        <div>
          <el-button type="primary" @click="handleLock">锁定并返回</el-button>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </div>
    </template>
    <el-upload
      ref="uploadRef"
      class="upload-excel"
      action="/api/fileInfo/upload"
      :data="{ userId: userId }"
      :show-file-list="false"
      accept="image/*,video/*,audio/*,application/pdf"
      multiple
      :on-success="handleUploadSuccess"
      :on-preview="handlePictureCardPreview"
      :before-upload="beforeUpload"
    >
      <template v-slot:trigger>
        <el-button type="primary" :icon="Upload">上传资料</el-button>
      </template>
      <template #tip>
        <div class="el-upload__tip text-gray-500 text-sm mt-1">
          仅支持图片、视频、音频、PDF文件，最大5GB!
        </div>
      </template>
    </el-upload>
    <el-dialog v-model="dialogImgVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
    <div v-if="dataList.length" class="card">
      <div v-for="item in dataList" :key="item.name" class="device-item">
        <FileItem
          :id="item.id"
          :name="item.fileName"
          :hasRename="false"
          :hasDownload="true"
          @handleDownload="handleDownload(item)"
          @handleDelete="handleDelete(item)"
        />
      </div>
    </div>
    <el-empty v-else description="暂无数据" style="height: 80vh" />
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
import { Upload } from "@element-plus/icons-vue";
import axios from "axios";

const emit = defineEmits(["handleUpdate"]);

const uploadRef = ref();
const loading = ref(false);
const dialogVisible = ref(false);
const dialogImgVisible = ref(false);
const dialogImageUrl = ref("");
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
  ElMessageBox.confirm(`删除后不可恢复，确认删除该资料？`, `删除${item.name}`, {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
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

function handleUploadSuccess(res, file, fileLists) {
  fileKeys.value = res.data.fileKeys;
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
    uploadRef.value!.clearFiles(); // 清空本地上传的文件
  }
};

const handleBack = async () => {
  close();
  emit("handleUpdate");
};

const handleLock = async () => {
  loading.value = true;
  const list = fileList.value.map(item => {
    return {
      fileKey: item.fileKey,
      deviceCategoryId: row.value.id
    };
  });
  const params = {
    fileInfoList: list,
    userId: userId.value
  };
  const res: any = await fileUploadSave(params);
  loading.value = false;
  if (res.code === 1) {
    message(`锁定成功`, { type: "success" });
    emit("handleUpdate");
    close();
  }
};

// 资料下载
const handleDownload = async item => {
  try {
    const res: any = await axios({
      url: `/api/fileInfo/download/${item.id}`,
      method: "GET",
      responseType: "blob", // 关键点
      onDownloadProgress: progressEvent => {
        const percent = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        console.log("下载进度:", percent + "%");
      }
    });

    // 创建下载链接
    const blob = new Blob([res]);
    // const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.fileName; // 自定义文件名
    a.click();

    // 释放内存
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载失败：", error);
  }
};

const handlePictureCardPreview = uploadFile => {
  dialogImageUrl.value = uploadFile.url!;
  dialogImgVisible.value = true;
};

// 上传前校验文件类型和大小
function beforeUpload(file: File) {
  const isAllowed =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/") ||
    file.type === "application/pdf";
  if (!isAllowed) {
    message(`仅支持上传图片、视频、音频或 PDF 文件！`, { type: "error" });
    return false;
  }
  const isLtMax = file.size / 1024 / 1024 < 5000;
  if (!isLtMax) {
    message(`文件大小不能超过5GB！`, { type: "error" });
    return false;
  }
  return true;
}

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
