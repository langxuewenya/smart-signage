<template>
  <div>
    <div class="top-btn">
      <div class="left">
        <div class="title">设备列表</div>
        <el-input
          v-model="searchWord"
          class="responsive-input"
          placeholder="请输入关键词，并按回车键搜索"
          :prefix-icon="Search"
          @keyup.enter="getListData"
        />
      </div>
      <el-button type="primary" @click="handleCreate">创建设备</el-button>
    </div>
    <div v-if="deviceList.length" v-loading="loading" class="card">
      <div v-for="item in deviceList" :key="item.name" class="device-item">
        <DeviceItem
          :device="item"
          :details="details"
          @handleUpdate="handleUpdate"
          @handleDelete="handleDelete(item)"
        />
      </div>
    </div>
    <el-empty v-else description="暂无数据" style="border: 1px solid #eee" />

    <el-dialog
      v-model="dialogFormVisible"
      :title="`${dialogClass == 'add' ? '创建设备' : '修改设备'}`"
      width="600"
      @closed="handleClosed"
    >
      <el-form ref="ruleFormRef" :model="form">
        <template v-for="[key] in Object.entries(form)" :key="key">
          <el-form-item
            v-if="configContentMap.get(key)"
            v-model="form[key]"
            :rules="[
              {
                required: true,
                message: `请输入${configContentMap.get(key)}`,
                trigger: 'blur'
              }
            ]"
            :prop="key"
            :label="configContentMap.get(key)"
            :label-width="formLabelWidth"
          >
            <el-input v-model="form[key]" autocomplete="off" />
          </el-form-item>
        </template>

        <el-form-item label="LOGO" :label-width="formLabelWidth">
          <el-upload
            ref="uploadRef"
            class="upload-excel"
            action="/api/fileInfo/upload"
            :data="{ userId: userId }"
            accept="image/*"
            :limit="1"
            list-type="picture"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <template v-slot:trigger>
              <el-button :icon="Upload">上传图片</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip text-gray-500 text-sm mt-1">
                请上传长35，宽14尺寸的图片！
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm(ruleFormRef)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import type { FormInstance, UploadRawFile } from "element-plus";
import { Search, Upload } from "@element-plus/icons-vue";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import {
  getDeviceList,
  getInfoFieldList,
  addDevice,
  updateFile,
  deleteDevice
} from "@/api/common";
import { message } from "@/utils/message";
import { configContentMap } from "@/views/common";
import DeviceItem from "../components/device-item.vue";

const props = defineProps({
  deviceId: {
    type: String,
    default: ""
  }
});

// 要求的尺寸（像素）
const TARGET_WIDTH = 35;
const TARGET_HEIGHT = 14;

const ruleFormRef = ref<FormInstance>();
const uploadRef = ref();
const userId = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? ""
);

const loading = ref(false);
const searchWord = ref("");
const dialogFormVisible = ref(false);
const formLabelWidth = "110px";
const dialogClass = ref("add");
const form = reactive({
  logoUrl: "",
  id: ""
});
const deviceList = ref([]);
const details = ref([]); // 设备信息显示字段

const getListData = async () => {
  loading.value = true;
  details.value = [];
  const params = {
    userId: userId.value,
    deviceCategoryId: props.deviceId,
    deviceName: searchWord.value
  };
  const res: any = await getDeviceList(params);
  loading.value = false;
  deviceList.value = res.data.qrCodeInfos || [];
  formatDetails(res.data.qrCodeInfoStatus || {});
};

// 处理设备信息显示字段
const formatDetails = fileds => {
  for (const [key, value] of configContentMap) {
    if (fileds[key]) {
      details.value.push({
        value: key,
        label: value
      });
      form[key] = "";
    }
  }
};

const getCreateFiles = async () => {
  const res: any = await getInfoFieldList({
    userId: userId.value
  });
  const createConfig = res.data.find(item => item.tagType == 1);
  // 匹配设备列表创建录入信息字段
  for (const [key] of configContentMap) {
    if (createConfig[key]) {
      form[key] = "";
    }
  }
};

const handleCreate = () => {
  getCreateFiles();
  ruleFormRef.value?.resetFields();
  dialogClass.value = "add";
  dialogFormVisible.value = true;
};

const handleUpdate = item => {
  dialogClass.value = "edit";
  for (const key of Object.keys(form)) {
    form[key] = item[key];
  }
  dialogFormVisible.value = true;
};

const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      if (dialogClass.value == "add") {
        const res: any = await addDevice({
          ...form,
          userId: userId.value,
          deviceCategoryId: props.deviceId,
          tagType: "1",
          id: null
        });
        if (res.code == 1) {
          message(`创建设备成功`, { type: "success" });
          dialogFormVisible.value = false;
          getListData();
        }
      } else if (dialogClass.value == "edit") {
        const res: any = await updateFile({
          ...form,
          userId: userId.value
        });
        if (res.code == 1) {
          message(`更新设备成功`, { type: "success" });
          dialogFormVisible.value = false;
          getListData();
        }
      }
    }
  });
};

const handleDelete = item => {
  ElMessageBox.confirm(
    `删除后不可恢复，确认删除该设备？`,
    `删除${item.deviceName}`,
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      const params = [item.id];
      const res: any = await deleteDevice(params);
      if (res.code == 1) {
        message(`删除成功`, { type: "success" });
        getListData();
      }
    })
    .catch(() => {});
};

// 上传前校验函数
function beforeUpload(file: File) {
  if (!file.type.startsWith("image/")) {
    message(`请上传图片文件`, { type: "error" });
    return false;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      if (w === TARGET_WIDTH && h === TARGET_HEIGHT) {
        return true; // ✅ 尺寸正确，允许上传
      } else {
        message(
          `图片尺寸必须为 ${TARGET_WIDTH}x${TARGET_HEIGHT} 像素，当前为 ${w}x${h}`,
          { type: "error" }
        );
        return new Error("invalid dimensions");
      }
    };
    const result = e.target?.result;
    if (!result || typeof result !== "string") {
      message(`读取文件失败`, { type: "error" });
      return false;
      // return reject(false);
    }
    img.onerror = () => {
      message(`无法解析图片`, { type: "error" });
      return new Error("image parse error");
    };
    img.src = result;
  };
  reader.readAsDataURL(file);
}

function handleUploadSuccess(res, file) {
  message(`上传成功`, { type: "success" });
  form.logoUrl = `${res.data?.fileInfos[0].fileLoc}/${res.data?.fileInfos[0].filePath}`;
}

function handleClosed() {
  dialogFormVisible.value = false;
  uploadRef.value!.clearFiles();
  ruleFormRef.value?.resetFields(); // 动画结束后再清空数据
}

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

  .left {
    display: flex;
    justify-content: flex-start;
    width: 50%;

    .title {
      width: 80px;
      font-size: 16.38px;
      font-weight: 600;
      vertical-align: middle;
    }

    .responsive-input {
      display: inline-block;
      width: 300px;
      margin-left: 10px;

      ::v-deep(.el-input__wrapper) {
        width: 100%;
      }
    }
  }
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
    margin-right: 16px;
    margin-bottom: 16px;
  }
}
</style>
