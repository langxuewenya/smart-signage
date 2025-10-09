<template>
  <div>
    <div class="top-btn">
      <el-button type="success">标识牌列表</el-button>
      <el-button type="primary" @click="handleCreateClass">创建类别</el-button>
    </div>
    <el-card class="card">
      <div v-for="item in dataList" :key="item.name" class="device-item">
        <deviceItem
          :name="item.name"
          @handleRename="handleRename"
          @handleDelete="handleDelete"
          @click="handleClick"
        />
      </div>
      <!-- <el-badge value="已编辑" class="item" type="primary" :offset="[-50, 10]">
        <deviceItem name="文件1" />
      </el-badge>
      <el-badge value="未编辑" class="item" :offset="[-50, 10]">
        <deviceItem name="文件2" />
      </el-badge>
      <el-badge value="已锁定" class="item" type="warning" :offset="[-50, 10]">
        <deviceItem name="文件3" />
      </el-badge> -->
    </el-card>

    <el-dialog
      v-model="dialogFormVisible"
      :title="`${dialogClass == 'add' ? '创建设备类别' : '重命名'}`"
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
import { useRouter } from "vue-router";

const router = useRouter();
const dialogTableVisible = ref(false);
const dialogFormVisible = ref(false);
const formLabelWidth = "100px";
const dialogClass = ref("add");
const form = reactive({
  name: ""
});
const dataList = ref([
  {
    name: "双梁起重机"
  },
  {
    name: "液压升降车"
  },
  {
    name: "AGV平车"
  },
  {
    name: "V12陆上传动链台车"
  },
  {
    name: "V12陆上传动链台车2"
  },
  {
    name: "V12陆上传动链台车3"
  }
]);

const getListData = () => {
  dataList.value = dataList.value.map(item => {
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
  ElMessageBox.confirm(`删除后不可恢复，确认删除该类别？`, `删除${name}`, {
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

const handleClick = () => {
  router.push("/device-detail");
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
  }
}
// .card > *:not(:last-child) {
//   margin-right: 16px;
//   background-color: red;
// }
</style>
