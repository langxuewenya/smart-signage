<script setup lang="ts">
import Motion from "./utils/motion";
import { ref, toRaw } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { useLayout } from "@/layout/hooks/useLayout";
import { bg, avatar, illustration } from "./utils/static";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";

import jinfengForm from "./components/jinfeng-form.vue";
import universalForm from "./components/universal-form.vue";
import adminForm from "./components/admin-form.vue";
import enrollFrom from "./components/enroll-from.vue";
import updatePwd from "./components/update-pwd.vue";

defineOptions({
  name: "Login"
});

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

const activeName = ref("jf"); // 登录入口选择
const isEnroll = ref(false); // 是否注册
const isUpdatePwd = ref(false); // 是否修改密码

const handleEnroll = () => {
  // 注册
  isEnroll.value = !isEnroll.value;
};

const handleUpdatePassword = () => {
  // 修改密码
  isUpdatePwd.value = !isUpdatePwd.value;
};

const hendleRebackLogin = () => {
  if (isEnroll.value) isEnroll.value = false;
  if (isUpdatePwd.value) isUpdatePwd.value = false;
};
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-hidden">{{ title }}</h2>
          </Motion>

          <el-tabs
            v-if="!isEnroll && !isUpdatePwd"
            v-model="activeName"
            type="border-card"
            class="demo-tabs"
            :stretch="true"
          >
            <el-tab-pane label="金风专用" name="jf">
              <jinfengForm />
            </el-tab-pane>
            <el-tab-pane label="通用登录" name="ty">
              <universalForm />
            </el-tab-pane>
            <el-tab-pane label="超级管理员" name="admin">
              <adminForm />
            </el-tab-pane>
          </el-tabs>
          <enrollFrom v-if="isEnroll" @enrollSuccess="hendleRebackLogin" />
          <updatePwd v-if="isUpdatePwd" />
          <div
            v-if="activeName !== 'admin' && !isEnroll && !isUpdatePwd"
            class="flex-between"
          >
            <div class="enroll" @click="handleEnroll">新用户注册</div>
            <div class="update-password" @click="handleUpdatePassword">
              修改密码
            </div>
          </div>
          <div
            v-if="activeName !== 'admin' && (isEnroll || isUpdatePwd)"
            class="flex-between"
          >
            <div class="enroll" @click="hendleRebackLogin">登录已有账号</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  padding: 10px;

  .enroll,
  .update-password {
    display: inline-block;
    font-family:
      "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    font-size: 14px;
    color: #409eff;
  }

  .enroll:hover,
  .update-password:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
