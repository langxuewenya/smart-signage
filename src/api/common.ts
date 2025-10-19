import { http } from "@/utils/http";

/** 查询文件列表 */
export const getFileList = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/query", { data });
};

/** 新增/重命名文件 */
export const addFile = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/add", { data });
};

/** 删除文件 */
export const deleteFile = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/delDocument", { data });
};

/** 查询设备信息 */
export const getDeviceList = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/query", { data });
};

/** 新增设备信息 */
export const addDevice = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/add", { data });
};

/** 更新设备信息 */
export const updateFile = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/update", { data });
};

/** 删除设备信息 */
export const deleteDevice = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/delInfo", { data });
};

/** 设备列表引用设备类型文件夹-保存 */
export const saveQuoteInfo = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/saveQuoteInfo", {
    data
  });
};

/** 设备类型引用模版-保存 */
export const saveQuoteType = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/saveQuoteType", {
    data
  });
};

/** 查询标识盘录入信息字段列表 */
export const getInfoFieldList = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/queryQrcodeInfoStauts", {
    data
  });
};

/** 查询资料列表 */
export const getDatumList = (data?: object) => {
  return http.request("post", "/api/fileInfo/queryFile", {
    data
  });
};

/** 资料上传 */
export const fileUpload = (data?: object) => {
  return http.request("post", "/api/fileInfo/upload", {
    data
  });
};

/** 资料保存 */
export const fileUploadSave = (data?: object) => {
  return http.request("post", "/api/fileInfo/saveFile", {
    data
  });
};

/** 资料删除 */
export const fileUploadDelete = (data?: object) => {
  return http.request("post", "/api/fileInfo/delFile", {
    data
  });
};

/** 资料下载 */
export const fileDownload = (params?: string) => {
  return http.request("post", `/api/fileInfo/download/${params}`);
};

/** 查询标识牌列表 */
export const getSignboardList = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/getInfoList", {
    data
  });
};

/** 查询引用列表 */
export const getImportTypeList = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/getQuoteTypeList", {
    data
  });
};

/** 生成标识盘 */
export const generateQrCode = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/generationQrCode", {
    data
  });
};
