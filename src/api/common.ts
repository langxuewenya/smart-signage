import { http } from "@/utils/http";

/** 查询文件列表 */
export const getFileList = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/query", { data });
};

/** 新增文件 */
export const addFile = (data?: object) => {
  return http.request("post", "/api/sys/deviceCategory/add", { data });
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
  return http.request("post", "/api/sys/deviceCategory/add", { data });
};

/** 查询标识盘录入信息字段列表 */
export const getInfoFieldList = (data?: object) => {
  return http.request("post", "/api/sys/qrcodeInfo/queryQrcodeInfoStauts", {
    data
  });
};
