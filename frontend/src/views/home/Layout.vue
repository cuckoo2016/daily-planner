<template>
  <div class="user-app">
    <header class="user-app-header">
      <div class="user-app-header-inner">
        <div class="titles">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p v-if="headerSubtitle" class="page-sub">{{ headerSubtitle }}</p>
        </div>
      </div>
    </header>

    <div class="user-app-body">
      <div class="user-app-inner">
        <router-view />
      </div>
    </div>

    <nav class="user-tabbar" aria-label="主导航">
      <router-link
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="tab-item"
        :class="{ active: isTabActive(tab) }"
      >
        <el-icon class="tab-icon" :size="22"><component :is="tab.icon" /></el-icon>
        <span class="tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { House, Clock, Bell, User } from '@element-plus/icons-vue';

const route = useRoute();

const tabs = [
  { to: '/', name: 'home', label: '首页', icon: House },
  { to: '/history', name: 'history', label: '历史', icon: Clock },
  { to: '/reminders', name: 'reminders', label: '提醒', icon: Bell },
  { to: '/profile', name: 'profile', label: '我的', icon: User }
] as const;

const titleMap: Record<string, string> = {
  home: '首页',
  history: '历史计划',
  reminders: '提醒设置',
  profile: '我的'
};

const pageTitle = computed(() => titleMap[route.name as string] || '每日规划');

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const headerSubtitle = computed(() => {
  if (route.name !== 'home') return '';
  const d = new Date();
  const hello =
    d.getHours() < 12 ? '上午好' : d.getHours() < 18 ? '下午好' : '晚上好';
  return `${hello} · ${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
});

function isTabActive(tab: (typeof tabs)[number]) {
  if (tab.name === 'home') return route.name === 'home';
  return route.name === tab.name;
}
</script>

<style scoped>
.user-app {
  --user-primary: #3d9b8c;
  --user-primary-soft: rgba(61, 155, 140, 0.12);
  --user-bg: #f0f4f3;
  --user-card: #ffffff;
  --user-text: #1c2d2a;
  --user-muted: #6b7f7a;
  --user-tabbar-h: 56px;
  --user-header-h: auto;

  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--user-bg);
  color: var(--user-text);
  padding-bottom: calc(var(--user-tabbar-h) + env(safe-area-inset-bottom, 0px));
}

.user-app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  padding-top: env(safe-area-inset-top, 0px);
  background: linear-gradient(180deg, #e8f3f0 0%, var(--user-bg) 100%);
  border-bottom: 1px solid rgba(61, 155, 140, 0.12);
}

.user-app-header-inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 14px 20px 12px;
}

.titles {
  text-align: left;
}

.page-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--user-text);
}

.page-sub {
  margin: 6px 0 0;
  font-size: 0.875rem;
  color: var(--user-muted);
  font-weight: 400;
}

.user-app-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.user-app-inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px 16px 24px;
  min-height: 100%;
}

.user-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  gap:5px;
  max-width: 640px;
  margin: 0 auto;
  min-height: var(--user-tabbar-h);
  padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(61, 155, 140, 0.1);
  box-shadow: 0 -4px 24px rgba(28, 45, 42, 0.06);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 44px;
  text-decoration: none;
  color: var(--user-muted);
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 12px;
  transition: color 0.15s ease, background 0.15s ease;
}

.tab-item.active {
  color: var(--user-primary);
  background: var(--user-primary-soft);
}

.tab-icon {
  opacity: 0.85;
}

.tab-item.active .tab-icon {
  opacity: 1;
}

.tab-label {
  line-height: 1.2;
}

@media (min-width: 768px) {
  .user-app-inner {
    padding: 20px 24px 32px;
  }

  .user-tabbar {
    border-radius: 16px 16px 0 0;
  }
}
</style>

<style>
/* Dark theme override for user app variables */
html.dark .user-app {
  --user-primary: #4db5a5;
  --user-primary-soft: rgba(77, 181, 165, 0.15);
  --user-bg: #0d1117;
  --user-card: #161b22;
  --user-text: #e6edf3;
  --user-muted: #7d8590;
}

html.dark .user-app-header {
  background: linear-gradient(180deg, #161b22 0%, var(--user-bg) 100%);
  border-bottom-color: #30363d;
}

html.dark .user-tabbar {
  background: rgba(22, 27, 34, 0.96);
  border-top-color: #30363d;
}
</style>
