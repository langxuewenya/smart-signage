<template>
  <el-dialog
    v-model="dialogVisible"
    v-loading="loading"
    fullscreen
    :show-close="false"
    @open="handleOpen"
  >
    <template #header>
      <div class="top">
        <h3>文件列表 {{ row.name }} 创建</h3>
        <el-button @click="close">返回</el-button>
      </div>
    </template>
    <el-button type="primary" @click="handleCreate">创建文件</el-button>
    <div v-if="dataList.length" class="card">
      <div v-for="item in dataList" :key="item.name" class="device-item">
        <FileItem
          :id="item.id"
          :name="item.name"
          @handleRename="handleRename"
          @handleDelete="handleDelete(item)"
        />
      </div>
    </div>
    <el-empty v-else description="暂无数据" style="height: 90vh" />

    <el-dialog
      v-model="dialogFormVisible"
      :close-on-click-modal="false"
      :title="`${dialogClass == 'add' ? '创建文件' : '重命名'}`"
      width="500"
    >
      <el-form :model="form">
        <el-form-item label="文件名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import FileItem from "../components/file-item.vue";
import { ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import { getFileList, addFile, deleteFile } from "@/api/common";
import { message } from "@/utils/message";

const loading = ref(false);
const dialogVisible = ref(false);
const dialogFormVisible = ref(false);
const formLabelWidth = "80px";
const dialogClass = ref("add");
const row = ref();
const form = reactive({
  name: "",
  id: null
});
const dataList = ref([]);

const handleOpen = () => {
  window.getSelection()?.removeAllRanges();
};

const getListData = async () => {
  loading.value = true;
  const params = {
    type: "4", // 文件列表-文件
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    parentId: row.value.id
  };
  const res: any = await getFileList(params);
  loading.value = false;
  dataList.value = res.data || [];
};

const handleCreate = () => {
  form.name = "";
  form.id = "";
  dialogClass.value = "add";
  dialogFormVisible.value = true;
};

const handleRename = (name, id) => {
  form.name = name;
  form.id = id;
  dialogClass.value = "edit";
  dialogFormVisible.value = true;
};

const handleConfirm = async () => {
  const res: any = await addFile({
    name: form.name,
    type: "4",
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    parentId: row.value.id,
    id: form.id
  });
  if (res.code == 1) {
    message(`${dialogClass.value == "add" ? "创建文件" : "重命名文件"}成功`, {
      type: "success"
    });
    dialogFormVisible.value = false;
    getListData();
  }
};

const handleDelete = item => {
  ElMessageBox.confirm(`删除后不可恢复，确认删除该文件？`, `删除${item.name}`, {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const params = [item.id];
      const res: any = await deleteFile(params);
      if (res.code == 1) {
        message(`删除成功`, { type: "success" });
        getListData();
      }
    })
    .catch(() => {});
};

const show = item => {
  dialogVisible.value = true;
  row.value = item;
  getListData();
};
const close = () => {
  dialogVisible.value = false;
  dataList.value = [];
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

.card {
  width: 100%;
  height: 100%;
  padding-top: 25px;
  padding-left: 20px;
  overflow-y: auto;

  .device-item {
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 15px;
  }
}
</style>
