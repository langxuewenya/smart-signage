<template>
  <el-card class="device-item">
    <!-- <div class="title">

      <img :src="deviceIcon" width="25" height="25" />
      <span>{{ name }}</span>
    </div> -->
    <img :src="props.device.logoUrlAddress" width="80" />
    <div v-for="item in props.details" :key="item.value" class="info-item">
      <span class="label">{{ item.label }}：</span>
      <span class="value">{{ device[item.value] }}</span>
    </div>
    <div class="option">
      <el-button type="text" @click="handleUpdate">更新</el-button>
      <!-- <el-button type="text" @click="handleCheck">核对</el-button> -->
      <el-button type="text" style="color: #f56c6c" @click="handleDelete"
        >删除</el-button
      >
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import deviceIcon from "@/assets/icon/device.png";

const props = defineProps({
  device: {
    type: Object,
    default: () => {}
  },
  // 设备信息显示字段
  details: {
    type: Array as () => any[],
    default: () => []
  }
});

const emit = defineEmits([
  "update:modelValue",
  "handleUpdate",
  "handleDelete",
  "handleCheck"
]);

const handleUpdate = () => {
  emit("handleUpdate", props.device);
};
const handleDelete = () => {
  emit("handleDelete");
};
const handleCheck = () => {
  emit("handleCheck");
};
</script>

<style scoped lang="scss">
.device-item {
  display: flex;
  align-items: center;
  justify-content: center;

  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
    font-size: 14px;

    .label {
      width: 110px;
      text-align: left;
    }

    .value {
      flex: 1;
      margin-left: 5px;
      text-align: left;
    }
  }

  .option {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
}
</style>
