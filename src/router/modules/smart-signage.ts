export default [
  {
    path: "/user-mgr",
    name: "user-mgr",
    component: () => import("@/views/admin/user/index.vue"),
    meta: {
      title: "用户管理",
      icon: "ep/home-filled",
      rank: 10,
      roles: ["admin"]
    }
  },
  {
    path: "/device-class",
    name: "device-class",
    component: () => import("@/views/device/device-class.vue"),
    meta: {
      title: "设备类别创建",
      icon: "ep:lollipop",
      rank: 10,
      roles: ["jinfeng", "universal"]
    }
  }
] satisfies Array<RouteConfigsTable>;
