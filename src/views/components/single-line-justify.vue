<template>
  <div ref="containerRef" class="justify-text">
    {{ text }}
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";

// 文字内容（父组件可以传入）
const props = defineProps({
  text: {
    type: String,
    required: true
  }
});

const containerRef = ref(null);

/**
 * 自动布匀函数（单行）
 */
function justifyText(container) {
  const text = container.textContent.trim();
  const numChars = text.length;
  if (numChars < 2) return;

  // 临时元素测量文字宽度
  const temp = document.createElement("span");
  temp.style.visibility = "hidden";
  temp.style.position = "absolute";
  temp.style.fontSize = window.getComputedStyle(container).fontSize;
  temp.style.fontFamily = window.getComputedStyle(container).fontFamily;
  temp.textContent = text;
  document.body.appendChild(temp);
  const textWidth = temp.offsetWidth;
  document.body.removeChild(temp);

  const containerWidth = container.clientWidth || 100; // 固定宽度时需要容错
  const spacing = (containerWidth - textWidth) / (numChars - 1);

  container.style.letterSpacing = spacing + "px";
}

// 初始化或文字更新时调用
onMounted(() => {
  nextTick(() => {
    justifyText(containerRef.value);
  });
});

watch(
  () => props.text,
  () => {
    nextTick(() => {
      justifyText(containerRef.value);
    });
  }
);
</script>

<style scoped>
.justify-text {
  width: 100%; /* 父容器宽度决定布匀范围 */
  overflow: hidden;
  white-space: nowrap; /* 单行显示 */
}
</style>
