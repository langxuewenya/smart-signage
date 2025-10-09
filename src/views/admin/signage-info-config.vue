<template>
  <div>
    <div class="top-btn">
      <el-button type="primary">保存</el-button>
      <el-button type="info" @click="handleToBack">返回</el-button>
    </div>
    <pure-table :data="dataList" :columns="columns" :pagination="pagination">
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
  </div>
</template>

<script lang="ts" setup>
import "@pureadmin/table/dist/style.css";
import { PureTable } from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";

const router = useRouter();

const dataList = ref([
  {
    content: "设备标签号",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "名称",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "规格型号",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "图纸号/物料号",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "出厂编码",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "SN码/序列码",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "外形尺寸",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备自重",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "生产厂家",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "出厂时间",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备负责人",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备责任单位",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备归属单位",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备类别",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备位置",
    entering: false,
    deviceShow: false,
    signageShow: false
  },
  {
    content: "设备状态",
    entering: false,
    deviceShow: false,
    signageShow: false
  }
]);
const columns = ref([
  { type: "index", label: "序号", align: "center", width: 80 },
  {
    prop: "content",
    label: "配置内容",
    align: "center",
    minWwidth: 100
  },
  {
    prop: "entering",
    label: "设备列表创建录入信息",
    align: "center",
    minWwidth: 100,
    slot: "entering"
  },
  {
    prop: "deviceShow",
    label: "设备列表显示信息",
    align: "center",
    minWwidth: 150,
    slot: "device-show"
  },
  {
    prop: "signageShow",
    label: "标识牌展示信息",
    align: "center",
    minWwidth: 150,
    slot: "signage-show"
  }
  // ...
]);
const pagination = ref({
  page: 1,
  pageSize: 10
  // 可选配置项
});

const getListData = () => {
  dataList.value = dataList.value.map(item => {
    return {
      ...item
    };
  });
};

const handleSignageShowChange = row => {
  const chooseCount = dataList.value.filter(
    item => item.signageShow == true
  ).length;
  if (chooseCount > 8) {
    row.signageShow = false;
    message("标识牌展示信息最多可选8个", { type: "warning" });
  }
};

const handleToBack = () => {
  router.push("user-mgr");
};

onMounted(() => {
  getListData();
});
</script>

<style scoped lang="scss">
.top-btn {
  display: flex;
  justify-content: end;
  margin-bottom: 10px;
}
</style>
