<template>
  <el-dialog
    v-model="dialogVisible"
    fullscreen
    :show-close="false"
    @open="handleOpen"
  >
    <div class="top">
      <h3>{{ deviceName }} 明细</h3>
      <el-button @click="close">返回</el-button>
    </div>
    <div v-if="dialogVisible" style="margin: 25px 20px 10px">
      <fileList :deviceId="deviceId" />
      <deviceType :deviceId="deviceId" />
      <deviceList
        :deviceId="deviceId"
        @handleBack="close"
        @toSignboardList="toSignboardList"
      />
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import fileList from "./file-list.vue";
import deviceType from "./device-type.vue";
import deviceList from "./device-list.vue";

const emit = defineEmits(["toSignboardList"]);

const dialogVisible = ref(false);
const deviceName = ref("");
const deviceId = ref("");

const handleOpen = () => {
  window.getSelection()?.removeAllRanges();
};

const show = device => {
  dialogVisible.value = true;
  deviceName.value = device.name;
  deviceId.value = device.id;
};
const close = () => {
  dialogVisible.value = false;
};
const toSignboardList = () => {
  close();
  emit("toSignboardList");
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
</style>
