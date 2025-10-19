<template>
  <div>
    <div class="top-btn">
      <el-input
        v-model="searchUserName"
        class="input"
        placeholder="请输入用户名搜索"
        clearable
        :prefix-icon="Search"
      />
      <el-button type="primary" @click="getListData">搜索</el-button>
      <el-button @click="getListData">刷新</el-button>
    </div>
    <pure-table
      :data="dataList"
      :columns="columns"
      :pagination="pagination"
      :loading="loading"
      style="height: 76vh"
      @page-size-change="handleSizeChange"
      @page-current-change="handleCurrentChange"
    >
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
        <el-date-picker
          v-model="row.dateRange"
          v-model:visible="row.showPicker"
          :disabled="!!row.num"
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
          v-model="row.num"
          :disabled="!!row.dateRange?.length"
          :min="0"
          style="width: 80%"
        />
      </template>
      <template #hasNum="{ row }"> {{ row.alreadyNum || 0 }} 个 </template>
      <template #signage-info="{ row }">
        <el-button type="success" @click="handleToConfigInfo(row)"
          >配置标识牌录入信息</el-button
        >
      </template>
      <!-- :disabled="row.status !== '待审核'" -->
      <template #option="{ row }">
        <el-button type="primary" @click="handleSave(row)">保存</el-button>
      </template>
    </pure-table>
    <ConfigDialog ref="configDialogRef" @saveConfig="saveConfig" />
  </div>
</template>

<script lang="ts" setup>
import "@pureadmin/table/dist/style.css";
import { PureTable } from "@pureadmin/table";
import { onMounted, ref } from "vue";
import { adminCheckUser, adminCheckUserList } from "@/api/admin";
import { message } from "@/utils/message";
import { Search } from "@element-plus/icons-vue";
import ConfigDialog from "./config-dialog.vue";

const configDialogRef = ref();
const searchUserName = ref("");
const loading = ref(false);
const dataList = ref([]);
const columns = ref([
  { type: "index", label: "序号", align: "center", width: 80 },
  { prop: "userId", label: "用户名", align: "center", minWidth: 120 },
  // { prop: "pwd", label: "密码", align: "center", minWidth: 150 },
  {
    prop: "way",
    label: "生效系统",
    align: "center",
    minWidth: 150,
    slot: "way"
  },
  {
    prop: "endTime",
    label: "有效期截止时间",
    align: "center",
    minWidth: 300,
    slot: "endTime"
  },
  {
    prop: "num",
    label: "标识牌允许创建数量",
    align: "center",
    minWidth: 180,
    slot: "allowNum"
  },
  {
    prop: "alreadyNum",
    label: "标识牌已创建数量",
    align: "center",
    minWidth: 150,
    slot: "hasNum"
  },
  {
    prop: "",
    label: "标识牌录入信息选择",
    align: "center",
    minWidth: 190,
    slot: "signage-info"
  },
  { prop: "", label: "操作", align: "center", width: 120, slot: "option" }
]);
const pagination = ref({
  pageSize: 10,
  currentPage: 1,
  total: 0,
  background: true, // 是否带背景
  layout: "total, prev, pager, next, sizes"
});

const getListData = async () => {
  loading.value = true;
  const res: any = await adminCheckUserList({
    userId: searchUserName.value,
    pageNum: pagination.value.currentPage,
    pageSize: pagination.value.pageSize
  });
  loading.value = false;
  dataList.value =
    res.data.list.map(item => {
      return {
        ...item,
        showPicker: false,
        dateRange: item.way == "2" ? [item.startTime, item.endTime] : [],
        num: item.way == "1" ? Number(item.num) : 0,
        wayList: item.type == "3" ? ["1", "2"] : [item.type] // 生效系统
      };
    }) || [];
  pagination.value.total = res.data.total || 0;
};

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  getListData();
};

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page;
  getListData();
};

const handleSave = async row => {
  const params = {
    ...row,
    type: computedType(row.wayList),
    way: row?.dateRange?.length ? "2" : "1", // 生效方式(1数量 2时间)
    startTime: row?.dateRange?.[0] || "",
    endTime: row?.dateRange?.[1] || "",
    sysQrcodeInfoStatusList: row.sysQrcodeInfoStatusList || []
  };
  console.log(params);
  const res: any = await adminCheckUser(params);
  if (res.code == 1) {
    message("审核成功", { type: "success" });
    getListData();
  }
};

// 生效系统类型判断 1金风/2普通二维码/3全部
const computedType = wayList => {
  if (wayList.includes("1")) {
    if (wayList.includes("2")) {
      return "3";
    }
    return "1";
  } else if (wayList.includes("2")) {
    return "2";
  }
};

// 保存标识牌录入信息配置
const saveConfig = row => {
  handleSave(row);
};

const handleToConfigInfo = row => {
  configDialogRef.value.show(row);
};

onMounted(() => {
  getListData();
});
</script>

<style scoped lang="scss">
.top-btn {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;

  .input {
    width: 300px;
    margin-right: 10px;
  }
}

.way-checkbox {
  display: inline-block;
  text-align: left;
}
</style>
