const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import { storageLocal } from "@pureadmin/utils";
import { type DataInfo, userKey } from "@/utils/auth";

const redirectUrl = () => {
  const roles = storageLocal().getItem<DataInfo<number>>(userKey)?.roles;
  console.log(roles);
  if (roles.includes("admin")) {
    return "/user-mgr";
  } else {
    return "/device-class";
  }
};

export default {
  path: "/",
  name: "Home",
  component: Layout,
  // redirect: "/welcome",
  redirect: redirectUrl(),
  meta: {
    icon: "ep/home-filled",
    title: "首页",
    rank: 0
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: "首页",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    }
  ]
} satisfies RouteConfigsTable;
