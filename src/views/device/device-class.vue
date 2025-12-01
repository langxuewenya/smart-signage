<template>
  <div>
    <div class="top-btn">
      <el-button type="success" @click="handleToSignboard"
        >标识牌列表</el-button
      >
      <el-button type="primary" @click="handleCreateClass">创建类别</el-button>
    </div>
    <el-card v-if="dataList.length" v-loading="loading" class="card">
      <div v-for="item in dataList" :key="item.name" class="device-item">
        <FileItem
          :id="item.id"
          :name="item.name"
          @handleRename="handleRename"
          @handleDelete="handleDelete(item)"
          @dblclick="handleDBClick(item)"
        />
      </div>
    </el-card>
    <el-empty v-else description="暂无数据" style="height: 75vh" />
    <DetailDialog ref="detailDialogRef" @toSignboardList="handleToSignboard" />
    <SignboardList ref="signboardListRef" />

    <el-dialog
      v-model="dialogFormVisible"
      :title="`${dialogClass == 'add' ? '创建设备类别' : '重命名'}`"
      :close-on-click-modal="false"
      width="500"
    >
      <el-form :model="form">
        <el-form-item label="设备类别名称" :label-width="formLabelWidth">
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { getFileList, addFile, deleteFile } from "@/api/common";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import DetailDialog from "./detail-dialog.vue";
import SignboardList from "./signboard-list.vue";
import FileItem from "../components/file-item.vue";

const signboardListRef = ref();
const loading = ref(false);
const dialogFormVisible = ref(false);
const formLabelWidth = "100px";
const dialogClass = ref("add");
const detailDialogRef = ref();
const userId = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? ""
);
const form = reactive({
  name: "",
  id: null
});
const dataList = ref([]);

const getListData = async () => {
  loading.value = true;
  const params = {
    type: "1", // 设备类别
    userId: userId.value
  };
  const res: any = await getFileList(params);
  loading.value = false;
  dataList.value = res.data || [];
};

const handleCreateClass = () => {
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
    type: "1",
    userId: userId.value,
    parentId: 0,
    id: form.id
  });
  if (res.code == 1) {
    message(`${dialogClass.value == "add" ? "创建" : "重命名"}"成功"`, {
      type: "success"
    });
    dialogFormVisible.value = false;
    getListData();
  }
};

const handleDelete = item => {
  ElMessageBox.confirm(
    `删除后不可恢复，确认删除该设备类别？`,
    `删除${item.name}`,
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
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

const handleDBClick = item => {
  detailDialogRef.value.show(item);
};

const handleToSignboard = () => {
  signboardListRef.value.show();
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

.card {
  display: flex;
  align-items: start;
  width: 100%;
  height: 75vh;

  .device-item {
    display: inline-block;
    margin-right: 16px;
    margin-bottom: 16px;
    font-size: 15px;
  }
}
</style>
