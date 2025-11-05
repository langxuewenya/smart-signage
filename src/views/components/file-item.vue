<template>
  <el-card style="width: 200px; height: 100px" class="device-item">
    <div class="title">
      <img v-if="props.type == 'file'" :src="fileIcon" />
      <img v-else-if="isImage(props.type)" :src="imageIcon" />
      <img v-else-if="isAudio(props.type)" :src="audioIcon" />
      <img v-else-if="isVideo(props.type)" :src="vedioIcon" />
      <img v-else-if="isPdf(props.type)" :src="pdfIcon" />
      <span>{{ name }}</span>
    </div>
    <div class="option">
      <el-button v-if="hasRename" type="text" @click="handleRename"
        >重命名</el-button
      >
      <el-button v-if="hasDownload" type="text" @click="handleDownload"
        >下载</el-button
      >
      <el-button type="text" style="color: #f56c6c" @click="handleDelete"
        >删除</el-button
      >
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import fileIcon from "@/assets/icon/file.png";
import imageIcon from "@/assets/icon/image.png";
import vedioIcon from "@/assets/icon/video.png";
import audioIcon from "@/assets/icon/audio.png";
import pdfIcon from "@/assets/icon/pdf.png";

const props = defineProps({
  name: {
    type: String,
    default: ""
  },
  id: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: "file"
  },
  hasRename: {
    type: Boolean,
    default: true
  },
  hasDownload: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  "update:modelValue",
  "handleRename",
  "handleDelete",
  "handleDownload"
]);

const handleRename = () => {
  emit("handleRename", props.name, props.id);
};
const handleDownload = () => {
  emit("handleDownload", props.name, props.id);
};
const handleDelete = () => {
  emit("handleDelete");
};

// 是否为图片
function isImage(file) {
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(file);
}
// 是否为音频
function isAudio(file) {
  return [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"].includes(file);
}
// 是否为视频
function isVideo(file) {
  return [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".mpeg"].includes(
    file
  );
}
// 是否为pdf
function isPdf(file) {
  return [".pdf"].includes(file);
}
</script>

<style scoped lang="scss">
.device-item {
  display: flex;
  align-items: center;
  justify-content: center;

  .title {
    display: flex;
    height: 40px;

    img {
      width: 30px;
      height: 30px;
    }

    span {
      display: -webkit-box;
      margin-left: 8px;
      overflow: hidden;
      -webkit-line-clamp: 2; // 限制显示2行
      line-height: 1.4;
      -webkit-box-orient: vertical;
    }
  }

  .option {
    display: flex;
    justify-content: space-between;
  }
}
</style>
