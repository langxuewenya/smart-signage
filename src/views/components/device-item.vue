<template>
  <el-popover
    placement="top-start"
    title="详细信息"
    :width="200"
    trigger="hover"
  >
    <template #reference>
      <el-card style="width: 200px; height: 100px" class="device-item">
        {{ device.deviceName }}
        <div class="option">
          <el-button type="text" @click="handleUpdate">更新</el-button>
          <el-button type="text" style="color: #f56c6c" @click="handleDelete"
            >删除</el-button
          >
        </div>
      </el-card>
    </template>
    <div v-for="item in props.details" :key="item?.value">
      <span>{{ item?.label }}：{{ device[item?.value] }}</span>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";

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

const emit = defineEmits(["update:modelValue", "handleUpdate", "handleDelete"]);

const handleUpdate = () => {
  emit("handleUpdate", props.device);
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

.device-item.el-tooltip__trigger {
  display: block !important; /* 避免 inline-block 的缝隙 */
}
</style>
