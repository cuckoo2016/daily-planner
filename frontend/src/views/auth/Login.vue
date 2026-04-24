<template>
  <div class="cute-auth-page">
    <!-- 动画背景 -->
    <div class="bg-decorations" aria-hidden="true">
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
      <div class="cloud cloud-3">☁️</div>
      <div class="star star-1">✨</div>
      <div class="star star-2">⭐</div>
      <div class="star star-3">🌟</div>
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
    </div>

    <div class="auth-container">
      <!-- 可爱的品牌区域 -->
      <div class="brand-section">
        <div class="cute-mascot" :class="{ bounce: isHovered }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
          <div class="mascot-face">
            <div class="eye eye-left"></div>
            <div class="eye eye-right"></div>
            <div class="cheek cheek-left"></div>
            <div class="cheek cheek-right"></div>
            <div class="mouth"></div>
          </div>
          <div class="mascot-body">
            <div class="heart heart-1">💕</div>
            <div class="heart heart-2">💖</div>
          </div>
        </div>
        <h1 class="title">每日规划</h1>
        <p class="subtitle">让每一天都闪闪发光 ✨</p>
      </div>

      <!-- 登录表单卡片 -->
      <div class="cute-card" :class="{ shake: shakeError }">
        <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @submit.prevent="handleLogin">
          <!-- 用户名输入框 -->
          <div class="input-wrapper" :class="{ focused: focusStates.username }">
            <span class="input-icon">🌸</span>
            <el-form-item prop="username" class="no-margin">
              <el-input
                v-model="form.username"
                placeholder="输入你的用户名"
                size="large"
                clearable
                @focus="focusStates.username = true"
                @blur="focusStates.username = false"
              >
              </el-input>
            </el-form-item>
          </div>

          <!-- 密码输入框 -->
          <div class="input-wrapper" :class="{ focused: focusStates.password }">
            <span class="input-icon">🔐</span>
            <el-form-item prop="password" class="no-margin">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="输入你的密码"
                size="large"
                show-password
                clearable
                @focus="focusStates.password = true"
                @blur="focusStates.password = false"
              >
              </el-input>
            </el-form-item>
          </div>

          <!-- 登录按钮 -->
          <el-form-item class="btn-container">
            <button
              type="submit"
              class="cute-submit-btn"
              :class="{ loading: loading, success: loginSuccess }"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner">🌀</span>
              <span v-else-if="loginSuccess" class="success-icon">🎉</span>
              <span v-else>登录  →</span>
            </button>
          </el-form-item>
        </el-form>

        <!-- 底部链接 -->
        <div class="card-footer">
          <span class="footer-text">还没有账号？</span>
          <router-link to="/register" class="cute-link">
            立即注册 <span class="link-arrow">→</span>
          </router-link>
        </div>
      </div>

      <!-- 底部装饰 -->
      <div class="bottom-decoration">
        <span class="deco-flower">🌷</span>
        <span class="deco-flower">🌻</span>
        <span class="deco-flower">🌺</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, type FormInstance } from 'element-plus';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const loginSuccess = ref(false);
const isHovered = ref(false);
const shakeError = ref(false);

const focusStates = reactive({
  username: false,
  password: false
});

const form = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

async function handleLogin() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      shakeError.value = true;
      setTimeout(() => shakeError.value = false, 500);
      return;
    }

    loading.value = true;
    try {
      await authStore.login(form.username, form.password);
      loginSuccess.value = true;
      ElMessage.success('欢迎回来！🥰');
      setTimeout(() => {
        const redirect = (route.query.redirect as string) || '/';
        router.push(redirect);
      }, 800);
    } catch (error: any) {
      ElMessage.error(error.message || '登录失败，再试一次吧 💪');
      shakeError.value = true;
      setTimeout(() => shakeError.value = false, 500);
    } finally {
      if (!loginSuccess.value) {
        loading.value = false;
      }
    }
  });
}
</script>

<style scoped>
.cute-auth-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff5f8 0%, #ffe8f0 25%, #f3e8ff 50%, #e8f4ff 75%, #f0fff4 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

/* 渐变背景动画 */
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* 背景装饰 */
.bg-decorations {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.cloud {
  position: absolute;
  font-size: 40px;
  opacity: 0.6;
  animation: floatCloud 20s ease-in-out infinite;
}

.cloud-1 {
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.cloud-2 {
  top: 20%;
  right: 10%;
  animation-delay: -5s;
  font-size: 50px;
}

.cloud-3 {
  bottom: 25%;
  left: 15%;
  animation-delay: -10s;
  font-size: 35px;
}

@keyframes floatCloud {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(30px) translateY(-10px);
  }
  50% {
    transform: translateX(60px) translateY(5px);
  }
  75% {
    transform: translateX(30px) translateY(-5px);
  }
}

.star {
  position: absolute;
  font-size: 24px;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 {
  top: 15%;
  left: 25%;
  animation-delay: 0s;
}

.star-2 {
  top: 8%;
  right: 30%;
  animation-delay: 0.7s;
  font-size: 20px;
}

.star-3 {
  bottom: 30%;
  right: 20%;
  animation-delay: 1.4s;
  font-size: 28px;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8) rotate(180deg);
  }
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.4), rgba(200, 162, 255, 0.3));
  animation: bubbleFloat 8s ease-in-out infinite;
}

.bubble-1 {
  width: 60px;
  height: 60px;
  bottom: 15%;
  left: 8%;
  animation-delay: 0s;
}

.bubble-2 {
  width: 40px;
  height: 40px;
  top: 40%;
  right: 8%;
  animation-delay: -3s;
}

.bubble-3 {
  width: 30px;
  height: 30px;
  bottom: 40%;
  left: 40%;
  animation-delay: -5s;
}

@keyframes bubbleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

/* 主容器 */
.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 380px;
}

/* 品牌区域 */
.brand-section {
  text-align: center;
  margin-bottom: 24px;
}

/* 可爱吉祥物 */
.cute-mascot {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cute-mascot.bounce {
  animation: mascotBounce 0.6s ease;
}

@keyframes mascotBounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.05) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-3deg); }
}

.mascot-face {
  width: 80px;
  height: 70px;
  background: linear-gradient(135deg, #ffb6c1, #ff91a4);
  border-radius: 50% 50% 45% 45%;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 8px 20px rgba(255, 145, 164, 0.4);
}

.eye {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
  top: 28px;
  animation: blink 4s ease-in-out infinite;
}

.eye-left {
  left: 18px;
}

.eye-right {
  right: 18px;
}

@keyframes blink {
  0%, 45%, 55%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.1);
  }
}

.cheek {
  position: absolute;
  width: 16px;
  height: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  top: 38px;
}

.cheek-left {
  left: 8px;
}

.cheek-right {
  right: 8px;
}

.mouth {
  position: absolute;
  width: 20px;
  height: 10px;
  border-bottom: 3px solid #333;
  border-radius: 0 0 50% 50%;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
}

.mascot-body {
  width: 60px;
  height: 30px;
  background: linear-gradient(135deg, #ffb6c1, #ff91a4);
  border-radius: 0 0 50% 50%;
  margin: -5px auto 0;
  position: relative;
}

.heart {
  position: absolute;
  font-size: 14px;
  opacity: 0;
  animation: heartFloat 2s ease-in-out infinite;
}

.heart-1 {
  left: -10px;
  top: 5px;
  animation-delay: 0s;
}

.heart-2 {
  right: -10px;
  top: 5px;
  animation-delay: 0.5s;
}

.cute-mascot:hover .heart {
  opacity: 1;
}

@keyframes heartFloat {
  0%, 100% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) scale(1);
    opacity: 1;
  }
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b9d, #c44bff, #7b61ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #887ab0;
  font-weight: 500;
}

/* 可爱卡片 */
.cute-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 28px 24px;
  box-shadow:
    0 10px 40px rgba(255, 107, 157, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cute-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 60px rgba(255, 107, 157, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
}

.cute-card.shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

/* 输入框包装 */
.input-wrapper {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 18px;
  padding: 6px 8px 6px 14px;
  margin-bottom: 16px;
  border: 2px solid #f3e8ff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(200, 162, 255, 0.1);
}

.input-wrapper.focused {
  border-color: #ff91a4;
  box-shadow: 0 4px 20px rgba(255, 145, 164, 0.25);
  transform: scale(1.02);
}

.input-icon {
  font-size: 20px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.input-wrapper.focused .input-icon {
  transform: scale(1.2) rotate(10deg);
}

.no-margin {
  margin: 0;
  flex: 1;
}

.auth-form :deep(.el-input__wrapper) {
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.auth-form :deep(.el-input__inner) {
  font-size: 15px;
  color: #5a4b80;
}

.auth-form :deep(.el-input__inner::placeholder) {
  color: #c0b8d8;
}

/* 按钮容器 */
.btn-container {
  margin: 24px 0 0;
}

/* 可爱按钮 */
.cute-submit-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44bff 50%, #7b61ff 100%);
  background-size: 200% 200%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(196, 75, 255, 0.35);
}

.cute-submit-btn:hover:not(:disabled) {
  background-position: 100% 100%;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 30px rgba(196, 75, 255, 0.45);
}

.cute-submit-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cute-submit-btn.loading,
.cute-submit-btn.success {
  pointer-events: none;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.success-icon {
  display: inline-block;
  animation: popIn 0.4s ease;
}

@keyframes popIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 底部链接 */
.card-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #f3e8ff;
}

.footer-text {
  font-size: 0.9rem;
  color: #998fc0;
}

.cute-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ff6b9d;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  margin-left: 6px;
  transition: all 0.3s ease;
}

.cute-link:hover {
  color: #c44bff;
  transform: translateX(4px);
}

.link-arrow {
  transition: transform 0.3s ease;
}

.cute-link:hover .link-arrow {
  transform: translateX(4px);
}

/* 底部装饰 */
.bottom-decoration {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}

.deco-flower {
  font-size: 24px;
  animation: flowerSway 3s ease-in-out infinite;
}

.deco-flower:nth-child(1) {
  animation-delay: 0s;
}

.deco-flower:nth-child(2) {
  animation-delay: 0.5s;
}

.deco-flower:nth-child(3) {
  animation-delay: 1s;
}

@keyframes flowerSway {
  0%, 100% {
    transform: rotate(-5deg) scale(1);
  }
  50% {
    transform: rotate(5deg) scale(1.1);
  }
}

/* 响应式 */
@media (min-width: 768px) {
  .cute-card {
    padding: 32px 28px;
  }

  .title {
    font-size: 2rem;
  }
}
</style>
