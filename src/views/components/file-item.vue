<template>
  <el-card style="width: 200px; height: 100px" class="device-item">
    {{ name }}
    <div class="option">
      <el-button v-show="hasRename" type="text" @click="handleRename"
        >重命名</el-button
      >
      <el-button v-show="hasDownload" type="text" @click="handleDownload"
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

const props = defineProps({
  name: {
    type: String,
    default: ""
  },
  id: {
    type: String,
    default: ""
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
</script>

<style scoped lang="scss">
.device-item {
  display: flex;
  align-items: center;
  justify-content: center;

  .option {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
}
</style>
