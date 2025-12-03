<template>
  <el-dialog
    v-model="dialogVisible"
    v-loading="loading"
    fullscreen
    :show-close="false"
  >
    <div class="top">
      <h3>标识牌列表</h3>
      <el-button @click="close">返回</el-button>
    </div>
    <div class="top-btn">
      <el-input
        v-model="searchValue"
        class="search"
        placeholder="请输入关键词搜索"
        clearable
        :prefix-icon="Search"
        @click="handleSearch"
      />
      <el-button type="primary" @click="getListData">搜索</el-button>
      <el-button @click="getListData">刷新</el-button>
    </div>
    <pure-table
      :data="dataList"
      :columns="columns"
      :loading="loading"
      style="height: 85vh"
    >
      <template #signboard="{ row }">
        <img :src="row.imageUrl" width="575" height="345" />
      </template>
      <template #type="{ row }">
        <el-tag v-if="row.codeType == '1'" type="warning" size="large"
          >金风专用</el-tag
        >
        <el-tag v-else type="primary" size="large">通用</el-tag>
      </template>
      <template #option="{ row }">
        <el-button type="success" @click="handleCopySignboard(row)"
          >复制标识牌</el-button
        >
        <el-button type="warning" @click="handleCopyQRCode(row)"
          >复制二维码</el-button
        >
        <el-button type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </pure-table>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { getSignboardList, deleteDevice } from "@/api/common";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";

const emit = defineEmits([]);

/** 当前对话框 **/
const dialogVisible = ref(false);
const loading = ref(false);
const show = () => {
  getListData();
  dialogVisible.value = true;
};
const close = () => {
  dialogVisible.value = false;
};
defineExpose({
  show,
  close
});

/** 搜索栏 */
const searchValue = ref("");
const handleSearch = () => {};
// 登录人userId
const userId = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? ""
);

/** 列表数据 */
const dataList = ref([]);
const columns = ref([
  {
    prop: "",
    label: "标识牌",
    align: "center",
    width: 600,
    slot: "signboard"
  },
  {
    prop: "",
    label: "类型",
    align: "center",
    minWidth: 100,
    slot: "type"
  },
  {
    prop: "",
    label: "操作",
    align: "center",
    minWidth: 150,
    slot: "option"
  }
]);
const getListData = async () => {
  loading.value = true;
  const res: any = await getSignboardList({
    param: searchValue.value,
    userId: userId.value
  });
  loading.value = false;
  console.log(res);
  dataList.value = res.data || [];
};
const handleCopySignboard = async row => {
  try {
    // 1. 下载图片为 Blob
    const res = await fetch(row.imageUrl);
    const blob = await res.blob();
    // 2. 封装成 ClipboardItem
    const data = [new ClipboardItem({ [blob.type]: blob })];
    // 3. 写入剪贴板
    await navigator.clipboard.write(data);

    message("复制图片成功", { type: "success" });
  } catch (err) {
    console.error("复制失败：", err);
    message("复制图片失败", { type: "error" });
  }
};
// 复制二维码
const handleCopyQRCode = async row => {
  try {
    // 1. 下载图片为 Blob
    const res = await fetch(row.qrcodeUrl);
    const blob = await res.blob();
    // 2. 封装成 ClipboardItem
    const data = [new ClipboardItem({ [blob.type]: blob })];
    // 3. 写入剪贴板
    await navigator.clipboard.write(data);

    message("复制图片成功", { type: "success" });
  } catch (err) {
    console.error("复制失败：", err);
    message("复制图片失败", { type: "error" });
  }
};
const handleDelete = async row => {
  ElMessageBox.confirm(
    `删除后不可恢复，确认删除该标识牌？`,
    `删除${row.deviceName}`,
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      const res: any = await deleteDevice([row.id]);
      if (res.code == 1) {
        message("删除成功", { type: "success" });
        getListData();
      }
    })
    .catch(() => {});
};

/** 分页器 */
// const pagination = ref({
//   pageSize: 10,
//   currentPage: 1,
//   // total: 0,
//   background: true, // 是否带背景
//   layout: "total, prev, pager, next, sizes"
// });
// const handleSizeChange = (size: number) => {
//   pagination.value.pageSize = size;
//   pagination.value.currentPage = 1;
//   getListData();
// };
// const handleCurrentChange = (page: number) => {
//   pagination.value.currentPage = page;
//   getListData();
// };
</script>

<style scoped lang="scss">
.top {
  display: flex;
  justify-content: space-between;
}

.top-btn {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;

  .search {
    width: 300px;
    margin-right: 10px;
  }
}
</style>
