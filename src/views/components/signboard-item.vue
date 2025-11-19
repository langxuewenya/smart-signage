<template>
  <div class="signboard-item">
    <div class="signboard-item-second-border">
      <!-- 左侧公司LOGO与二维码区域 -->
      <div class="left">
        <div class="logo">
          <img :src="info.logoUrlAddress" width="173" />
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
          <!-- <span class="label">{{ item.label }}</span> -->
          <SingleLineJustify
            v-if="item.label"
            class="label"
            :text="item.label"
          />
          <span class="value">：{{ info[item.value] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import QRCode from "qrcode";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import SingleLineJustify from "./single-line-justify.vue";

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
    `https://zhbs.goldwind.com/#/download?enterType=${enterType}&tagNum=${item.tagNum}`,
    // `http://192.168.0.102:8848/#/download?enterType=${enterType}&tagNum=${item.tagNum}`,
    {
      margin: 1 // 取消默认边距
    }
  );
  const canvas = document.getElementById("myCanvas");
  canvas.style.width = 173 + "px";
  canvas.style.height = 173 + "px";
};

defineExpose({
  generateQr
});
</script>

<style scoped lang="scss">
.signboard-item {
  width: 495px;
  aspect-ratio: 10 / 6;
  padding: 6px;
  font-family: "Microsoft YaHei", sans-serif;
  background-color: #fff;
  border: 1px solid;

  .signboard-item-second-border {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding-top: 14px;
    border: 1px solid;

    .left {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: calc(35% + 6px);

      .logo {
        margin-top: 5px;
        margin-bottom: 5px;
        font-size: 20px;
        font-weight: bold;
      }

      .qr-section {
        text-align: center;

        .qr-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgb(255 255 255);
        }
      }
    }

    .right {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-around;
      padding-left: 6px;

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;
        font-size: 15px;

        .label {
          width: 100px;
          color: #424141;
          text-align: left;
          text-align: justify;
        }

        .value {
          flex: 1;
          margin-left: 5px;
          color: #000;
          text-align: left;
        }
      }
    }
  }
}
</style>
