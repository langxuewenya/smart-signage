<template>
  <div class="smart-uploader">
    <el-upload
      class="upload-area"
      :limit="limit"
      :accept="accept"
      multiple
      :file-list="fileList"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      :on-remove="handleRemove"
      :on-preview="handlePreview"
      :before-upload="beforeUpload"
    >
      <el-button type="primary" :icon="Upload">上传资料</el-button>
      <template #tip>
        <div class="el-upload__tip text-gray-500 text-sm mt-1">
          仅支持图片、视频、PDF文件，最大5GB!
        </div>
      </template>
    </el-upload>

    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { Upload } from "@element-plus/icons-vue";
import { message } from "@/utils/message";
import { v4 as uuidv4 } from "uuid";

const emit = defineEmits(["handleUploadSuccess"]);

// ========== 可配置参数 ==========
const CHUNK_SIZE = 5 * 1024 * 1024; // 每个分片 5MB
// const CHUNK_SIZE = 10 * 1024 * 1024; // 每个分片 10MB
const MAX_RETRY = 3; // 每个分片最多重试3次

const props = defineProps({
  userId: { type: String },
  limit: { type: Number, default: 5 },
  accept: { type: String, default: "*" }
});

const fileList = ref([]);
const uploadProgress = ref(0);
const uploading = ref(false);

// 工具函数：生成唯一文件UUID
function generateUUID() {
  return uuidv4();
  // return crypto.randomUUID();
}

// 上传入口
async function handleFileChange(uploadFile) {
  const file = uploadFile.raw;
  if (!file) return;

  // 图片小文件直接上传image/*,video/*
  // if (file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) {
  //   await uploadSimpleFile(file);
  // } else {
  //   await uploadLargeFile(file);
  // }

  // 图片/pdf直接上传，视频就走大文件上传
  if (file.type.startsWith("video/")) {
    await uploadLargeFile(file);
  } else {
    await uploadSimpleFile(file);
  }
}

// 简单上传（小文件）
async function uploadSimpleFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", props.userId);

  try {
    uploading.value = true;
    const res = await axios.post(
      "/api/fileInfo/upload",
      // "/api/sys/qrcodeInfo/codeInfoFileUpload",
      formData
    );
    console.log("上传成功:", res.data);
    emit("handleUploadSuccess", res.data);
  } catch (err) {
    console.error("上传失败:", err);
  } finally {
    uploading.value = false;
  }
}

// 分片上传（大文件）
async function uploadLargeFile(file: File) {
  const fileId = generateUUID();
  console.log("file.size", file.size, CHUNK_SIZE);
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadedChunks = new Set();

  uploading.value = true;
  uploadProgress.value = 0;

  let lastResData = []; // 上传成功返回的结果

  for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
    const start = chunkNumber * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    let success = false;
    let attempts = 0;

    while (!success && attempts < MAX_RETRY) {
      try {
        const formData = new FormData();
        formData.append("userId", props.userId);
        formData.append("file", chunk);
        formData.append("chunkNumber", String(chunkNumber + 1));
        formData.append("totalChunks", String(totalChunks));
        formData.append("fileIdentifier", fileId);
        formData.append("fileName", file.name);

        // await axios.post("http://localhost:9000/video/chunkFile", formData, {
        const res: any = await axios.post("api/video/chunkFile", formData, {
          timeout: 30000
        });

        uploadedChunks.add(chunkNumber);
        success = true;

        // 更新进度
        uploadProgress.value = Math.round(
          (uploadedChunks.size / totalChunks) * 100
        );

        // 最后一个分片上传成功后接口自动合并，即可触发上传成功回调
        if (res.data.code == 1 && chunkNumber + 1 == totalChunks) {
          console.log("dshuoshnfoui", res.data);
          lastResData = res.data;
        }
      } catch (err) {
        attempts++;
        console.warn(`分片 ${chunkNumber + 1} 上传失败，重试第 ${attempts} 次`);
        if (attempts >= MAX_RETRY) {
          console.error(`分片 ${chunkNumber + 1} 上传多次失败`);
          uploading.value = false;
          return;
        }
      }
    }
  }

  // 所有分片上传完成后，调用合并接口
  // await mergeChunks(fileId, file.name, totalChunks);
  emit("handleUploadSuccess", lastResData);
  uploading.value = false;
}

// 调用合并接口
async function mergeChunks(
  fileId: string,
  fileName: string,
  totalChunks: number
) {
  try {
    // const res = await axios.post("http://localhost:9000/video/mergeChunks", {
    const res = await axios.post("api/video/mergeFile", {
      fileIdentifier: fileId,
      fileName,
      totalChunks,
      userId: props.userId
    });
    console.log("合并成功:", res.data);
    emit("handleUploadSuccess", res.data);
  } catch (err) {
    console.error("合并失败:", err);
  }
}

// 上传前校验文件类型和大小
function beforeUpload(file: File) {
  const isAllowed =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type === "application/pdf";
  if (!isAllowed) {
    message(`仅支持上传图片、视频或 PDF 文件！`, { type: "error" });
    return false;
  }
  const isLtMax = file.size / 1024 / 1024 < 5000;
  if (!isLtMax) {
    message(`文件大小不能超过5GB！`, { type: "error" });
    return false;
  }
  return true;
}

// 文件操作
function handleRemove(file) {
  console.log("删除文件:", file);
}
function handlePreview(file) {
  console.log("预览文件:", file);
}
</script>

<style scoped>
.smart-uploader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-progress {
  width: 400px;
}
</style>
