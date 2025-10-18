<template>
  <div>
    <!-- 搜索栏 -->
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

    <!-- 列表数据 -->
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

    <!-- 新增/编辑弹窗 -->
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
            :file-list="imgFileList"
            list-type="picture"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :on-remove="handleRemoveImg"
          >
            <template v-slot:trigger>
              <el-button :icon="Plus">上传图片</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip text-gray-500 text-sm mt-1">
                请上传长35，宽14尺寸的图片！
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="引用类型模板" :label-width="formLabelWidth">
          <el-select
            v-model="typeFiles"
            value-key="id"
            multiple
            placeholder="请选择模板"
            @change="handleChangeTypeTem"
          >
            <el-option
              v-for="item in typeFilesList"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <!-- 上传资料 -->
        <el-form-item label="LOGO" :label-width="formLabelWidth">
          <el-upload
            ref="uploadDatumRef"
            class="upload-excel"
            action="/api/fileInfo/upload"
            :data="{ userId: userId }"
            :show-file-list="false"
            accept="image/*,video/*,audio/*,application/pdf"
            multiple
            :on-success="handleUploadDatumSuccess"
            :before-upload="beforeUploadDatum"
            :on-error="handleError"
          >
            <template v-slot:trigger>
              <el-button type="primary" :icon="Upload">上传资料</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip text-gray-500 text-sm mt-1">
                仅支持图片、视频、音频、PDF文件，最大5GB!
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <!-- 选择上传的资料 -->
        <el-form-item label="已选资料" :label-width="formLabelWidth">
          <div class="datum-list">
            <template v-for="item in form.infoFileList" :key="item.fileKey">
              <DatumItem
                :datum="item"
                @handleDeleteDatum="handleDeleteDatum(item)"
              />
            </template>
          </div>
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
import type { FormInstance } from "element-plus";
import { Search, Upload, Plus } from "@element-plus/icons-vue";
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";
import {
  getDeviceList,
  getInfoFieldList,
  addDevice,
  updateFile,
  deleteDevice,
  getImportTypeList
} from "@/api/common";
import { message } from "@/utils/message";
import { configContentMap } from "@/views/common";
import DeviceItem from "../components/device-item.vue";
import DatumItem from "../components/datum-item.vue";
import UploadInfo from "./upload-info.vue";

/** 页面 */
const loading = ref(false);
const props = defineProps({
  deviceId: {
    type: String,
    default: ""
  }
});

/** 列表数据 */
const searchWord = ref("");
const userId = ref(
  storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? ""
);
const details = ref([]); // 设备信息显示字段
const deviceList = ref([]);
async function getListData() {
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
}
// 处理设备信息显示字段
function formatDetails(fileds) {
  for (const [key, value] of configContentMap) {
    if (fileds[key]) {
      details.value.push({
        value: key,
        label: value
      });
      form[key] = "";
    }
  }
}

/** 设备 新增/编辑/删除 */
const formLabelWidth = "110px";
const dialogClass = ref("add");
const dialogFormVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const form = reactive({
  logoUrl: "",
  id: "",
  infoFileList: []
});
const uploadRef = ref();
function handleCreate() {
  getCreateFiles();
  ruleFormRef.value?.resetFields();
  dialogClass.value = "add";
  dialogFormVisible.value = true;
}
function handleUpdate(item) {
  dialogClass.value = "edit";
  for (const key of Object.keys(form)) {
    form[key] = item[key];
  }
  // 已上传图片回显
  if (item.logoUrl) {
    imgFileList.value = [
      {
        name: "已上传图片",
        url: item.logoUrl
      }
    ];
  }
  dialogFormVisible.value = true;
}
// 获取设备可录入信息字段
async function getCreateFiles() {
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
}
function handleDelete(item) {
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
}
async function handleConfirm(formEl: FormInstance | undefined) {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      if (dialogClass.value == "add") {
        const res: any = await addDevice({
          ...form,
          userId: userId.value,
          deviceCategoryId: props.deviceId,
          tagType: "1",
          id: null,
          infoFileList: form?.infoFileList?.map(item => {
            return {
              fileKey: item.fileKey
            };
          })
        });
        if (res.code == 1) {
          message(`创建设备成功`, { type: "success" });
          dialogFormVisible.value = false;
          getListData();
        }
      } else if (dialogClass.value == "edit") {
        const res: any = await updateFile({
          ...form,
          userId: userId.value,
          infoFileList: form?.infoFileList?.map(item => {
            return {
              fileKey: item.fileKey
            };
          })
        });
        if (res.code == 1) {
          message(`更新设备成功`, { type: "success" });
          dialogFormVisible.value = false;
          getListData();
        }
      }
    }
  });
}
function handleClosed() {
  dialogFormVisible.value = false;
  uploadRef.value!.clearFiles();
  ruleFormRef.value?.resetFields(); // 动画结束后再清空数据
  form.infoFileList = [];
  uploadDatumList.value = [];
  importDatumList.value = [];
  typeFiles.value = [];
}

/** 上传图片 */
const imgFileList = ref([]);
function handleUploadSuccess(res, file) {
  message(`上传成功`, { type: "success" });
  form.logoUrl = res.data?.fileInfos[0].fileKey;
  // form.logoUrl = `http://10.12.67.6/images/${res.data?.fileInfos[0].fileName}`;
  // 保留最新图片
  imgFileList.value = [
    {
      name: file.name,
      url: file.url
    }
  ];
}
// 上传前校验函数
function beforeUpload(file: File): Promise<boolean> | boolean {
  if (!file.type.startsWith("image/")) {
    message(`请上传图片文件`, { type: "error" });
    return false;
  }
  const TARGET_WIDTH = 35; // 要求的尺寸（像素）
  const TARGET_HEIGHT = 14;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result;
      if (!result || typeof result !== "string") {
        message("读取文件失败", { type: "error" });
        return reject(false); // 阻止上传
      }

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w === TARGET_WIDTH && h === TARGET_HEIGHT) {
          resolve(true); // 允许上传
        } else {
          message(
            `图片尺寸必须为 ${TARGET_WIDTH}x${TARGET_HEIGHT} 像素，当前为 ${w}x${h}`,
            { type: "error" }
          );
          reject(false); // 阻止上传
        }
      };

      img.onerror = () => {
        message("无法解析图片", { type: "error" });
        reject(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      message("文件读取失败", { type: "error" });
      reject(false);
    };

    reader.readAsDataURL(file);
  });
}
function handleRemoveImg() {
  imgFileList.value = [];
}

/** 引用类型模板 */
const typeFiles = ref([]);
const typeFilesList = ref([]);
const importDatumList = ref([]); // 引用的资料列表
// 查询引用类型模板
async function getTypeFilesList() {
  const res: any = await getImportTypeList({
    userId: userId.value,
    type: "5" //引用文件夹类型
  });
  if (res.code == 1) {
    typeFilesList.value = res.data || [];
  }
}
function handleChangeTypeTem(list) {
  console.log("lllxxsyddik");
  handleUpdateDatumList(list);
}
// 更新资料文件
function handleUpdateDatumList(list) {
  importDatumList.value = [];
  list.map(item => {
    item?.sysDeviceFileRelationList.map(i => {
      importDatumList.value.push(i);
    });
  });
  updateDatumList();
}

/** 上传资料 */
const uploadDatumRef = ref();
const uploadDatumList = ref([]); // 已上传的资料列表
function handleUploadDatumSuccess(res, file, fileLists) {
  uploadDatumList.value = uploadDatumList.value.concat(
    res.data.fileInfos || []
  );
  // uploadDatumList.value.push(res.data.fileInfos || []);
  updateDatumList();
}
function handleError(err: any, file: any) {
  console.error("上传失败", err, file);
}
function beforeUploadDatum(file: File) {
  const isAllowed =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/") ||
    file.type === "application/pdf";
  if (!isAllowed) {
    message(`仅支持上传图片、视频、音频或 PDF 文件！`, { type: "error" });
    return false;
  }
  const isLtMax = file.size / 1024 / 1024 < 5000;
  if (!isLtMax) {
    message(`文件大小不能超过5GB！`, { type: "error" });
    return false;
  }
  return true;
}

/** 所有资料展示 */
// 更新资料列表
function updateDatumList() {
  form.infoFileList = importDatumList.value.concat(uploadDatumList.value);
}
// 删除资料
function handleDeleteDatum(datum) {
  const index = form.infoFileList.findIndex(
    item => item.fileKey == datum.fileKey
  );
  form.infoFileList.splice(index, 1);
  // 若删除的资料为上传的资料，则还需删除已上传数组
  const upoladIndex = uploadDatumList.value.findIndex(
    item => item.fileKey == datum.fileKey
  );
  uploadDatumList.value.splice(upoladIndex, 1);
}

onMounted(() => {
  getListData();
  getTypeFilesList();
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
  // height: 300px;
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

.datum-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  min-height: 80px;
  overflow: auto;
  border: solid 1px #dcdfe6;
  border-radius: 5px;
}
</style>
