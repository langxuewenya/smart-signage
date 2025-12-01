<template>
  <div class="datum-item" @click="handleDownload">
    <img v-if="isImage(props.datum)" :src="imageIcon" />
    <img v-else-if="isAudio(props.datum)" :src="audioIcon" />
    <img v-else-if="isVideo(props.datum)" :src="vedioIcon" />
    <img v-else-if="isPdf(props.datum)" :src="pdfIcon" />
    <div class="name">{{ props.datum.fileName }}</div>
  </div>
</template>

<script setup lang="ts">
import imageIcon from "@/assets/icon/image.png";
import vedioIcon from "@/assets/icon/video.png";
import audioIcon from "@/assets/icon/audio.png";
import pdfIcon from "@/assets/icon/pdf.png";

const props = defineProps({
  datum: {
    type: Object,
    default: () => {}
  },
  canDelete: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["handleDownload"]);

// 是否为图片
function isImage(file) {
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(
    file.fileType
  );
}
// 是否为音频
function isAudio(file) {
  return [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"].includes(
    file.fileType
  );
}
// 是否为视频
function isVideo(file) {
  return [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".mpeg"].includes(
    file.fileType
  );
}
// 是否为pdf
function isPdf(file) {
  return [".pdf"].includes(file.fileType);
}

function handleDownload() {
  emit("handleDownload", props.datum);
}
</script>

<style scoped lang="scss">
.datum-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
  padding: 5px;
  margin: 5px;
  margin-top: 20px;

  img {
    width: 50px;
    height: 50px;
  }

  .name {
    display: -webkit-box;
    max-width: 100%;
    // display: inline-block;
    margin-top: 5px;
    margin-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    text-align: center;
    word-wrap: break-word;
    -webkit-box-orient: vertical;
  }
}
</style>
