<template>
  <div class="signboard-item">
    <!-- 左侧公司LOGO与二维码区域 -->
    <div class="left">
      <div class="logo">
        <img :src="info.logoUrlAddress" width="50" />
      </div>
      <div class="qr-section">
        <div class="qr-placeholder">
          <canvas id="myCanvas" ref="qrcode" />
        </div>
      </div>
    </div>

    <!-- 右侧设备信息区域 -->
    <div class="right">
      <div v-for="item in showFileds" :key="item.value" class="info-item">
        <span class="label">{{ item.label }}：</span>
        <span class="value">{{ info[item.value] }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import QRCode from "qrcode";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  },
  showFileds: {
    type: Array as PropType<any[]>,
    default: () => []
  }
});

const qrcode = ref<HTMLCanvasElement | null>(null);

const generateQr = item => {
  let enterType = "";
  if (
    storageLocal().getItem<DataInfo<number>>(userKey)?.roles.includes("jinfeng")
  ) {
    enterType = "jinfeng";
  } else {
    enterType = "universal";
  }
  QRCode.toCanvas(
    qrcode.value,
    `http://192.168.0.101:8848/#/download?enterType=${enterType}&tagNum=${item.tagNum}`
  );
  const canvas = document.getElementById("myCanvas");
  canvas.style.width = 110 + "px";
  canvas.style.height = 110 + "px";
};

defineExpose({
  generateQr
});
</script>

<style scoped lang="scss">
.signboard-item {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 10px 20px;
  font-family: "Microsoft YaHei", sans-serif;
  color: rgb(0 255 0);
  background: rgb(26 26 26);
  border: 2px solid rgb(0 255 0);
  border-radius: 6px;

  .left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 30%;
    padding-right: 20px;
    border-right: 2px solid rgb(0 255 0);

    .logo {
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
    }

    .qr-section {
      text-align: center;

      .qr-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        background-color: rgb(255 255 255);
        border: 2px solid rgb(0 255 0);
      }
    }
  }

  .right {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-left: 10px;

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 14px;

      .label {
        width: 110px;
        color: rgb(255 255 255);
        text-align: right;
      }

      .value {
        flex: 1;
        text-align: left;
      }
    }
  }
}
</style>
