<template>
  <div class="auth-page">
    <div class="auth-bg" aria-hidden="true" />
    <div class="auth-card">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <h1 class="title">每日规划</h1>
        <p class="subtitle">注册账号，开始记录每一天</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" size="large" clearable>
            <template #prefix><el-icon><User /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="昵称（可选）" size="large" clearable>
            <template #prefix><el-icon><UserFilled /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（至少6位）"
            size="large"
            show-password
            clearable
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            show-password
            clearable
          >
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" class="submit-btn" native-type="submit">
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { User, UserFilled, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({ username: '', nickname: '', password: '', confirmPassword: '' });

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

async function handleRegister() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await authStore.register(form.username, form.password, form.nickname);
      ElMessage.success('注册成功，请登录');
      router.push('/login');
    } catch (error: any) {
      ElMessage.error(error.message || '注册失败');
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style scoped>
.auth-page {
  --el-color-primary: #3d9b8c;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: max(24px, env(safe-area-inset-top)) 20px max(32px, env(safe-area-inset-bottom));
  position: relative;
  overflow: hidden;
  background: #e8f2ef;
}

.auth-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 80% at 10% 0%, rgba(77, 181, 165, 0.35) 0%, transparent 55%),
    radial-gradient(90% 70% at 100% 20%, rgba(61, 155, 140, 0.22) 0%, transparent 50%),
    linear-gradient(180deg, #f5faf8 0%, #e8f2ef 45%, #dfece8 100%);
  pointer-events: none;
}

.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 28px 24px 26px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  border-radius: 24px;
  box-shadow:
    0 4px 24px rgba(28, 45, 42, 0.06),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  border: 1px solid rgba(61, 155, 140, 0.12);
}

.brand {
  text-align: center;
  margin-bottom: 22px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  margin: 0 auto 10px;
  border-radius: 14px;
  background: linear-gradient(145deg, #4db5a5, #3d9b8c);
  box-shadow: 0 6px 20px rgba(61, 155, 140, 0.35);
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c2d2a;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7f7a;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 14px;
  padding: 4px 14px;
  box-shadow: 0 0 0 1px rgba(61, 155, 140, 0.15) inset;
}

.submit-btn {
  width: 100%;
  height: 48px !important;
  border-radius: 14px !important;
  font-weight: 600;
  margin-top: 4px;
  background: linear-gradient(145deg, #4db5a5, #3d9b8c) !important;
  border: none !important;
}

.footer {
  text-align: center;
  margin-top: 8px;
  font-size: 0.9rem;
  color: #6b7f7a;
}

.footer a {
  color: #3d9b8c;
  text-decoration: none;
  font-weight: 600;
  margin-left: 6px;
}

@media (min-width: 768px) {
  .auth-card {
    padding: 36px 32px 32px;
  }
}
</style>
