<template>
  <div class="datum-item">
    <img v-if="isImage(props.datum)" :src="imageIcon" />
    <img v-else-if="isAudio(props.datum)" :src="audioIcon" />
    <img v-else-if="isVideo(props.datum)" :src="vedioIcon" />
    <img v-else-if="isPdf(props.datum)" :src="pdfIcon" />
    <div class="name">{{ props.datum.fileName }}</div>
    <el-icon class="delete-icon" @click="handleDeleteDatum"
      ><CircleCloseFilled
    /></el-icon>
  </div>
</template>

<script setup lang="ts">
import imageIcon from "@/assets/icon/image.png";
import vedioIcon from "@/assets/icon/video.png";
import audioIcon from "@/assets/icon/audio.png";
import pdfIcon from "@/assets/icon/pdf.png";
import { CircleCloseFilled } from "@element-plus/icons-vue";

const props = defineProps({
  datum: {
    type: Object,
    default: () => {}
  }
});

const emit = defineEmits(["handleDeleteDatum"]);

// 是否为图片
function isImage(file) {
  const ext = file?.fileName?.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
}
// 是否为音频
function isAudio(file) {
  const audioExtensions = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
  const name = file.fileName.toLowerCase();
  return audioExtensions.some(ext => name.endsWith(ext));
}
// 是否为视频
function isVideo(file) {
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
    ".flv",
    ".mpeg"
  ];
  const name = file.fileName.toLowerCase();
  return videoExtensions.some(ext => name.endsWith(ext));
}
// 是否为pdf
function isPdf(file) {
  const pdfExtensions = [".pdf"];
  const name = file.fileName.toLowerCase();
  return pdfExtensions.some(ext => name.endsWith(ext));
}
// 删除
function handleDeleteDatum() {
  emit("handleDeleteDatum");
}
</script>

<style scoped lang="scss">
.datum-item {
  display: flex;
  padding: 5px;
  margin: 5px;

  img {
    width: 25px;
    height: 25px;
  }

  .name {
    display: inline-block;
    margin-left: 5px;
  }

  .delete-icon {
    display: none;
  }
}

.datum-item:hover {
  color: #ff6565;
  cursor: pointer;

  .delete-icon {
    display: inline-block;
    color: #ff6565;
  }
}
</style>
