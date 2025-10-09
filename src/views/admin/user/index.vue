<template>
  <div>
    <!-- <div class="top-btn">
      <el-button type="primary">一键保存</el-button>
    </div> -->
    <pure-table :data="dataList" :columns="columns" :pagination="pagination">
      <template #way="{ row }">
        <el-checkbox-group v-model="row.wayList">
          <div class="way-checkbox">
            <el-checkbox label="金风专用" value="1" />
          </div>
          <div class="way-checkbox">
            <el-checkbox label="通用系统" value="2" />
          </div>
        </el-checkbox-group>
      </template>
      <template #endTime="{ row }">
        <!-- <el-date-picker
          v-model="row.endTime"
          :disabled="row.allowNum"
          type="date"
          style="width: 150px"
          format="YYYY-M-D"
          value-format="YYYY-M-D"
          placeholder="请选择截止日期"
        /> -->
        <el-date-picker
          v-model="row.dateRange"
          :disabled="row.allowNum"
          type="daterange"
          format="YYYY-M-D"
          value-format="YYYY-M-D"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="截止日期"
          style="width: 250px"
        />
      </template>
      <template #allowNum="{ row }">
        <el-input-number
          v-model="row.allowNum"
          :disabled="!!row.dateRange"
          :min="0"
          style="width: 80%"
        />
      </template>
      <template #hasNum="{ row }">
        <el-input-number
          v-model="row.hasNum"
          :min="0"
          :max="row.allowNum"
          style="width: 80%"
        />
      </template>
      <template #signage-info>
        <el-button type="success" @click="handleToConfigInfo"
          >配置标识牌录入信息</el-button
        >
      </template>
      <template #option>
        <el-button type="primary">保存</el-button>
      </template>
    </pure-table>
  </div>
</template>

<script lang="ts" setup>
import "@pureadmin/table/dist/style.css";
import { PureTable } from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const dataList = ref([
  {
    id: "1", //id
    name: "用户1",
    password: "xxx",
    type: "1", //1金风/2普通二维码/3全部
    way: "2", //生效方式(1数量 2时间)
    status: "有效",
    startTime: "2025-08-15", //生效开始时间
    endTime: "2025-08-16", //生效结束时间
    sysQrcodeInfoStatus: {
      tagNum: true, //标签号
      assetNum: true, //资产编号
      deviceName: false //设备名称
    },
    allowNum: 0,
    hasNum: 3
  },
  {
    id: "6fbb4f184ecb4d87beb9d16d5b446d4d", //id
    type: "3", //1金风/2普通二维码/3全部
    way: "2", //生效方式(1数量 2时间)
    status: "有效",
    startTime: "2025-08-15", //生效开始时间
    endTime: "", //生效结束时间
    sysQrcodeInfoStatus: {
      tagNum: true, //标签号
      assetNum: true, //资产编号
      deviceName: false //设备名称
    },
    allowNum: 11,
    hasNum: 5
  }
]);
const columns = ref([
  { type: "index", label: "序号", align: "center", width: 80 },
  { prop: "name", label: "用户名", align: "center", minWwidth: 100 },
  { prop: "password", label: "密码", align: "center", minWwidth: 100 },
  {
    prop: "way",
    label: "生效系统",
    align: "center",
    width: 120,
    slot: "way"
  },
  {
    prop: "endTime",
    label: "有效期截止时间",
    align: "center",
    width: 280,
    slot: "endTime"
  },
  {
    prop: "",
    label: "标识牌允许创建数量",
    align: "center",
    minWwidth: 120,
    slot: "allowNum"
  },
  {
    prop: "",
    label: "标识牌已创建数量",
    align: "center",
    minWwidth: 100,
    slot: "hasNum"
  },
  {
    prop: "",
    label: "标识牌录入信息选择",
    align: "center",
    width: 190,
    slot: "signage-info"
  },
  { prop: "", label: "操作", align: "center", minWwidth: 150, slot: "option" }
]);
const pagination = ref({
  page: 1,
  pageSize: 10
  // 可选配置项
});

const getListData = () => {
  dataList.value = dataList.value.map(item => {
    return {
      ...item,
      wayList: item.way == "1" ? ["1"] : item.way == "2" ? ["2"] : ["1", "2"] // 生效系统
    };
  });
};

const handleToConfigInfo = () => {
  router.push("signage-info-config");
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

.way-checkbox {
  display: inline-block;
  text-align: left;
}
</style>
