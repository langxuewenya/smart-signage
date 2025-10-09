<template>
  <div>
    <div class="top-btn">
      <h4>设备类型</h4>
      <el-button type="primary" @click="handleCreateClass">创建类型</el-button>
    </div>
    <el-card class="card">
      <div v-for="item in typeList" :key="item.name" class="device-item">
        <deviceItem
          :name="item.name"
          @handleRename="handleRename"
          @handleDelete="handleDelete"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogFormVisible"
      :title="`${dialogClass == 'add' ? '创建设备类型' : '重命名'}`"
      width="500"
    >
      <el-form :model="form">
        <el-form-item label="设备类型名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import deviceItem from "../components/device-item.vue";
import { ElMessage, ElMessageBox } from "element-plus";

const dialogTableVisible = ref(false);
const dialogFormVisible = ref(false);
const formLabelWidth = "100px";
const dialogClass = ref("add");
const form = reactive({
  name: ""
});
const typeList = ref([
  {
    name: "设备类型1"
  },
  {
    name: "设备类型2"
  }
]);

const getListData = () => {
  typeList.value = typeList.value.map(item => {
    return {
      ...item
    };
  });
};

const handleCreateClass = () => {
  form.name = "";
  dialogClass.value = "add";
  dialogFormVisible.value = true;
};

const handleRename = name => {
  console.log(name, "edit");
  form.name = name;
  dialogClass.value = "edit";
  dialogFormVisible.value = true;
};

const handleDelete = name => {
  ElMessageBox.confirm(`删除后不可恢复，确认删除该设备类型？`, `删除${name}`, {
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
  display: flex;
  align-items: start;
  width: 100%;

  .device-item {
    display: inline-block;
    margin-right: 16px;
    margin-bottom: 16px;
  }
}
</style>
