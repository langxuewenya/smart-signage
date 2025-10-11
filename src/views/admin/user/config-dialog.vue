<template>
  <el-dialog v-model="dialogVisible" fullscreen :show-close="false">
    <h3>用户 {{ userName }} 标识牌录入信息配置</h3>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSave"> 保存 </el-button>
        <el-button @click="close">返回</el-button>
      </div>
    </template>
    <pure-table
      :data="dataList"
      :columns="columns"
      style="height: 83vh; margin-top: 20px"
    >
      <template #entering="{ row }">
        <el-checkbox v-model="row.entering" />
      </template>
      <template #device-show="{ row }">
        <el-checkbox v-model="row.deviceShow" />
      </template>
      <template #signage-show="{ row }">
        <el-checkbox
          v-model="row.signageShow"
          @change="handleSignageShowChange(row)"
        />
      </template>
    </pure-table>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { message } from "@/utils/message";
import { configContentMap } from "@/views/common";

const emit = defineEmits(["saveConfig"]);

const dialogVisible = ref(false);
const userName = ref("");
const dataList = ref([]);
const rowData = ref();

const columns = ref([
  { type: "index", label: "序号", align: "center", width: 80 },
  {
    prop: "content",
    label: "配置内容",
    align: "center",
    minwidth: 100
  },
  {
    prop: "entering",
    label: "设备列表创建录入信息",
    align: "center",
    minwidth: 100,
    slot: "entering"
  },
  {
    prop: "deviceShow",
    label: "设备列表显示信息",
    align: "center",
    minwidth: 150,
    slot: "device-show"
  },
  {
    prop: "signageShow",
    label: "标识牌展示信息",
    align: "center",
    minwidth: 150,
    slot: "signage-show"
  }
]);

const show = row => {
  dialogVisible.value = true;
  rowData.value = row;
  userName.value = row.userId;
  dataList.value = formatDataList(row.sysQrcodeInfoStatusList || []);
};
const close = () => {
  dialogVisible.value = false;
};

// 数据格式化
const formatDataList = list => {
  let ret = [];
  for (const [key, value] of configContentMap) {
    ret.push({
      content: value,
      filed: key,
      entering: false,
      deviceShow: false,
      signageShow: false
    });
  }
  // tagType: 1设备列表标识牌录入信息 2设备列表显示信息 3标识牌展示信息
  list.map(item => {
    ret.map(i => {
      if (item[i.filed]) {
        if (item.tagType == 1) {
          i.entering = true;
        } else if (item.tagType == 2) {
          i.deviceShow = true;
        } else if (item.tagType == 3) {
          i.signageShow = true;
        }
      }
    });
  });
  return ret;
};

// 限制标识牌展示信息可选数量
const handleSignageShowChange = row => {
  const chooseCount = dataList.value.filter(
    item => item.signageShow == true
  ).length;
  if (chooseCount > 8) {
    row.signageShow = false;
    message("标识牌展示信息最多可选8个", { type: "warning" });
  }
};

const handleSave = () => {
  const list = [{ tagType: "1" }, { tagType: "2" }, { tagType: "3" }];
  dataList.value.map(item => {
    if (item.entering) {
      list[0][item.filed] = true;
    }
    if (item.deviceShow) {
      list[1][item.filed] = true;
    }
    if (item.signageShow) {
      list[2][item.filed] = true;
    }
  });
  rowData.value.sysQrcodeInfoStatusList = list;
  emit("saveConfig", rowData.value);
  close();
};

defineExpose({
  show,
  close
});
</script>
