<template>
  <div>
    <div class="top-btn">
      <h3>文件列表</h3>
      <el-button type="primary" @click="handleCreateClass">创建文件</el-button>
    </div>
    <div v-if="fileList.length" v-loading="loading" class="card">
      <div v-for="item in fileList" :key="item.name" class="device-item">
        <deviceItem
          :id="item.id"
          :name="item.name"
          @handleRename="handleRename"
          @handleDelete="handleDelete"
        />
      </div>
    </div>
    <el-empty v-else description="暂无数据" style="border: 1px solid #eee" />

    <el-dialog
      v-model="dialogFormVisible"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import deviceItem from "../components/device-item.vue";
import { ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import { getFileList, addFile } from "@/api/common";
import { message } from "@/utils/message";

const props = defineProps({
  deviceId: {
    type: String,
    default: ""
  }
});

const loading = ref(false);
const dialogFormVisible = ref(false);
const formLabelWidth = "80px";
const dialogClass = ref("add");
const form = reactive({
  name: "",
  id: null
});
const fileList = ref([]);

const getListData = async () => {
  loading.value = true;
  const params = {
    type: "2", // 文件列表（资料模板）
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    parentId: props.deviceId
  };
  const res: any = await getFileList(params);
  loading.value = false;
  fileList.value = res.data || [];
};

const handleCreateClass = () => {
  form.name = "";
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
    type: "2",
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    parentId: props.deviceId,
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

const handleDelete = name => {
  ElMessageBox.confirm(`删除后不可恢复，确认删除该文件？`, `删除${name}`, {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      // const deleteRes = await store.dispatch(
      //   "systemModule/deletePageRowAction",
      //   {
      //     pageName: props.pageName,
      //     queryInfo: {
      //       id: scope.row.id
      //     }
      //   }
      // );
      // if (deleteRes.code == 200) {
      //   ElMessage.success(`删除${props.listTableConfig.title}成功`);
      //   getPageData(queryCache.value);
      // }
    })
    .catch(() => {});
};

onMounted(() => {
  getListData();
});
</script>

<style scoped lang="scss">
.top-btn {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 8px;
}

.card {
  width: 100%;
  height: 300px;
  padding-top: 25px;
  padding-left: 20px;
  overflow-y: auto;
  border: 1px solid #eee;

  .device-item {
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 15px;
  }
}
</style>
