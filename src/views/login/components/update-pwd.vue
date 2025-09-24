<template>
  <el-tabs
    v-model="activeName"
    type="border-card"
    :stretch="true"
    class="demo-tabs"
  >
    <el-tab-pane label="修改密码" name="enroll">
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="loginRules"
        size="large"
      >
        <el-form-item
          :rules="[
            {
              required: true,
              message: '请输入账号',
              trigger: 'blur'
            }
          ]"
          prop="username"
        >
          <el-input
            v-model="ruleForm.username"
            clearable
            placeholder="请输入账号"
            :prefix-icon="useRenderIcon(User)"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="ruleForm.password"
            clearable
            show-password
            placeholder="请输入密码"
            :prefix-icon="useRenderIcon(Lock)"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="ruleForm.confirmPwd"
            clearable
            show-password
            placeholder="请确认密码"
            :prefix-icon="useRenderIcon(Lock)"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            class="w-full"
            type="primary"
            :loading="loading"
            :disabled="disabled"
            @click="onLogin(ruleFormRef)"
          >
            提交修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { loginRules } from "../utils/rule";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useUserStoreHook } from "@/store/modules/user";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import { initRouter, getTopMenu } from "@/router/utils";
import { debounce } from "@pureadmin/utils";

const ruleFormRef = ref<FormInstance>();

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const activeName = ref("enroll");

const ruleForm = reactive({
  username: "",
  password: "",
  confirmPwd: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message("登录失败", { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

const handleEnroll = () => {
  // 注册
};

const handleUpdatePassword = () => {
  // 修改密码
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});
</script>

<style scoped lang="scss"></style>
