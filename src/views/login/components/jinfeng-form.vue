<template>
  <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
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
        placeholder="账号"
        :prefix-icon="useRenderIcon(User)"
      />
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="ruleForm.password"
        clearable
        show-password
        placeholder="密码"
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
        登录
      </el-button>
    </el-form-item>
    <div class="tips">密码丢失请联系超级管理员找回</div>
  </el-form>
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
import { initRouter } from "@/router/utils";
import { debounce } from "@pureadmin/utils";

const ruleFormRef = ref<FormInstance>();

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);

const ruleForm = reactive({
  username: "admin",
  password: "123456"
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByJF({
          userId: ruleForm.username,
          pwd: ruleForm.password
        })
        .then((res: any) => {
          if (res.code == 1) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push("device-class")
                .then(() => {
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message(`登录失败，${res.message}`, { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
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

<style scoped lang="scss">
.tips {
  margin-top: -5px;
  font-family:
    "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: 13px;
  color: #888889;
}
</style>
