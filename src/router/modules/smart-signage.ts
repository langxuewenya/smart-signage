export default [
  {
    path: "/user-mgr",
    name: "user-mgr",
    component: () => import("@/views/admin/user/index.vue"),
    meta: {
      title: "用户管理",
      icon: "ep/home-filled",
      rank: 10
    }
  },
  {
    path: "/signage-info-config",
    name: "signage-inf0-config",
    component: () => import("@/views/admin/signage-info-config.vue"),
    meta: {
      title: "标识牌录入信息配置",
      icon: "ep:lollipop",
      rank: 10,
      showLink: false
    }
  },
  {
    path: "/device-class",
    name: "device-class",
    component: () => import("@/views/device/device-class.vue"),
    meta: {
      title: "设备类别创建",
      icon: "ep:lollipop",
      rank: 10
    }
  },
  {
    path: "/device-detail",
    name: "device-detail",
    component: () => import("@/views/device/device-detail.vue"),
    meta: {
      title: "设备明细",
      icon: "ep:lollipop",
      rank: 10,
      showLink: false
    }
  }
] satisfies Array<RouteConfigsTable>;
