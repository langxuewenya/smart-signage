import { http } from "@/utils/http";

/** 管理员审核列表页 */
export const adminCheckUserList = (data?: object) => {
  return http.request("post", "/api/sys/user/query", { data });
};

/** 管理员审核用户 */
export const adminCheckUser = (data?: object) => {
  return http.request("post", "/api/sys/user/checkUser", { data });
};
