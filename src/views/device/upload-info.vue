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
      accept="image/*,video/*,audio/*,application/pdf"
      multiple
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :on-preview="handlePictureCardPreview"
      :before-upload="beforeUpload"
    >
      <template v-slot:trigger>
        <el-icon><UploadFilled /></el-icon> 上传资料
      </template>
    </el-upload>
    <el-dialog v-model="dialogImgVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>
    <!-- <FileUpload
      v-if="dialogVisible"
      v-model:file-list="fileList"
      action="/api/fileInfo/upload"
      :limit="5"
      :data="{ userId: userId }"
      :maxSizeMB="100"
      @success="handleUploadSuccess"
      @update:fileList="files = $event"
    /> -->
    <div v-if="dataList.length" class="card">
      <div v-for="item in dataList" :key="item.name" class="device-item">
        <FileItem
          :id="item.id"
          :name="item.name"
          :hasRename="false"
          :hasDownload="true"
          @handleDownload="handleDownload"
          @handleDelete="handleDelete(item)"
        />
      </div>
    </div>
    <el-empty v-else description="暂无数据" style="height: 80vh" />
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, useId } from "vue";
import FileItem from "../components/file-item.vue";
import { ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import { getDatumList, fileUploadSave, fileUploadDelete } from "@/api/common";
import { message } from "@/utils/message";
import FileUpload from "../components/file-upload.vue";
import type { UploadProps } from "element-plus";
import { Upload, UploadFilled } from "@element-plus/icons-vue";

const emit = defineEmits(["handleUpdate"]);

const uploadRef = ref();
const loading = ref(false);
const dialogVisible = ref(false);
const dialogImgVisible = ref(false);
const dialogFormVisible = ref(false);
const dialogImageUrl = ref("");
const row = ref();
const dataList = ref([]);
const fileList = ref([]);
const fileKeys = ref([]);
const userId = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? ""
);
const successCount = ref(0); // 成功上传数量

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
  console.log("fileKeys.value", fileKeys.value);
  console.log("fileLists", fileLists);
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
  // loading.value = true;
  // const list = fileKeys.value.map(item => {
  //   return {
  //     fileKey: item,
  //     deviceCategoryId: row.value.id
  //   };
  // });
  // const params = {
  //   fileInfoList: list,
  //   userId: userId.value
  // };
  // const res: any = await fileUploadSave(params);
  // loading.value = false;
  // if (res.code === 1) {
  //   message(`锁定成功`, { type: "success" });
  //   emit("handleUpdate");
  //   close();
  // }
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
const handleDownload = () => {};

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
