<template>
  <el-tabs
    v-model="activeName"
    type="border-card"
    :stretch="true"
    class="demo-tabs"
  >
    <el-tab-pane label="用户注册" name="enroll">
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
            placeholder="请输入账号（建议使用手机号或身份证号）"
            :prefix-icon="useRenderIcon(User)"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="ruleForm.password"
            clearable
            show-password
            placeholder="请输入密码"
            :prefix-icon="useRenderIcon(Lock)"
          />
        </el-form-item>
        <el-form-item>
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
            @click="handleEnroll(ruleFormRef)"
          >
            注册
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
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import { debounce } from "@pureadmin/utils";
import { enrollApi } from "@/api/user";

const ruleFormRef = ref<FormInstance>();

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const activeName = ref("enroll");

const emit = defineEmits(["enrollSuccess"]);

const ruleForm = reactive({
  username: "",
  password: "",
  confirmPwd: ""
});

const confirmPwd = () => {
  if (ruleForm.password !== ruleForm.confirmPwd) {
    message("两次密码输入不一致，请检查密码", { type: "error" });
    return false;
  }
  return true;
};

const handleEnroll = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  if (!confirmPwd()) return;
  await formEl.validate(async valid => {
    if (valid) {
      loading.value = true;
      await enrollApi({
        userId: ruleForm.username,
        pwd: ruleForm.password
      })
        .then((res: any) => {
          if (res?.code === 1) {
            message("用户已创建成功，请通知超级管理员设置权限", {
              type: "success"
            });
            emit("enrollSuccess");
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

const handleUpdatePassword = () => {
  // 修改密码
};

const immediateDebounce: any = debounce(
  formRef => handleEnroll(formRef),
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
