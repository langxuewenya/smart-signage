<template>
  <el-dialog
    v-model="dialogVisible"
    v-loading="loading"
    fullscreen
    :show-close="false"
  >
    <template #header>
      <div class="top">
        <h3>设备类型 {{ row.name }} 创建</h3>
        <el-button @click="close">返回</el-button>
      </div>
    </template>
    <el-button type="primary" @click="handleCreate">创建文件</el-button>
    <el-button type="success" @click="handleImport">引用模板</el-button>
    <div v-if="dataList.length" class="card">
      <div v-for="item in dataList" :key="item.name" class="device-item">
        <el-badge
          :value="item.status"
          :type="badgeStatus(item)"
          :offset="[-50, 10]"
          :badge-style="{ height: '26px' }"
        >
          <FileItem
            :id="item.id"
            :name="item.name"
            @handleRename="handleRename"
            @handleDelete="handleDelete(item)"
            @dblclick="handleDBClick(item)"
          />
        </el-badge>
      </div>
    </div>
    <el-empty v-else description="暂无数据" style="height: 90vh" />
    <UploadInfo ref="uploadInfoRef" @handleUpdate="getListData" />

    <!-- 创建文件 -->
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

    <!-- 引用模板 -->
    <el-dialog v-model="dialogTemplateVisible" title="引用模板" width="500">
      <el-form :model="form">
        <el-form-item label="文件模板" :label-width="formLabelWidth">
          <el-select v-model="fileTemplate" multiple placeholder="请选择模板">
            <el-option
              v-for="item in fileTemplateList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogTemplateVisible = false">取消</el-button>
          <el-button
            v-loading="importLoading"
            type="primary"
            @click="handleConfirmImport"
          >
            确认
          </el-button>
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
import { getFileList, addFile, saveQuoteType, deleteFile } from "@/api/common";
import { message } from "@/utils/message";
import UploadInfo from "./upload-info.vue";

const loading = ref(false);
const importLoading = ref(false);
const dialogVisible = ref(false);
const dialogFormVisible = ref(false);
const dialogTemplateVisible = ref(false);
const formLabelWidth = "80px";
const dialogClass = ref("add");
const row = ref();
const deviceId = ref(""); // 设备类别（最外层设备）id，用于获取文件模板
const form = reactive({
  name: "",
  id: null
});
const dataList = ref([]);
const fileTemplate = ref();
const fileTemplateList = ref([]);
const uploadInfoRef = ref();

const getListData = async () => {
  const params = {
    type: "5", // 设备类型-文件
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    parentId: row.value.id
  };
  loading.value = true;
  const res: any = await getFileList(params);
  loading.value = false;
  dataList.value = res.data || [];
};

const handleCreate = () => {
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
    type: "5",
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

const handleImport = () => {
  dialogTemplateVisible.value = true;
  fileTemplate.value = [];
  getFileTemplateList();
};

const handleConfirmImport = async () => {
  const params = {
    id: row.value.id,
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    quoteCategoryId: fileTemplate.value
  };
  importLoading.value = true;
  const res: any = await saveQuoteType(params);
  importLoading.value = false;
  if (res.code == 1) {
    message(`引用模板成功`, { type: "success" });
    dialogTemplateVisible.value = false;
    getListData();
  }
};

const getFileTemplateList = async () => {
  const params = {
    type: "2", // 文件列表（资料模板）
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    parentId: deviceId.value
  };
  const res: any = await getFileList(params);
  loading.value = false;
  fileTemplateList.value = res.data || [];
  console.log(fileTemplateList.value);
};

// 标记的显示状态
const badgeStatus = item => {
  if (item.status == "已编辑") {
    return "primary";
  } else if (item.status == "已锁定") {
    return "warning";
  }
  return undefined;
};

const show = (item, pDeviceId) => {
  dialogVisible.value = true;
  row.value = item;
  deviceId.value = pDeviceId;
  getListData();
};
const close = () => {
  dialogVisible.value = false;
  dataList.value = [];
};

const handleDBClick = item => {
  uploadInfoRef.value.show(item);
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
