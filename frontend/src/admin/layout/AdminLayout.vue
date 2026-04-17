<template>
  <div class="admin-shell">
    <aside class="admin-sidebar" aria-label="侧边导航">
      <div class="sidebar-brand">
        <span class="brand-title">管理后台</span>
        <span class="brand-sub">每日规划</span>
      </div>
      <div class="sidebar-menu-wrap">
        <AdminMenu />
      </div>
      <div class="sidebar-footer">
        <el-button class="sidebar-link" text @click="router.push('/')">
          <el-icon><Monitor /></el-icon>
          返回前台
        </el-button>
        <el-button class="sidebar-link logout" text @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <el-button
          class="nav-trigger"
          :icon="Menu"
          circle
          aria-label="打开菜单"
          @click="drawerOpen = true"
        />
        <div class="header-titles">
          <el-breadcrumb v-if="!isCompact" class="breadcrumb" separator="/">
            <el-breadcrumb-item>管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPage }}</el-breadcrumb-item>
          </el-breadcrumb>
          <h1 class="page-heading">{{ currentPage }}</h1>
          <p v-if="!isCompact" class="page-meta">{{ authStore.user?.nickname }}</p>
        </div>
        <div class="header-actions">
          <span class="nick desktop-nick">{{ authStore.user?.nickname }}</span>
          <el-button type="primary" link class="action-link" @click="router.push('/')">返回前台</el-button>
          <el-button type="danger" link class="action-link" @click="handleLogout">退出</el-button>
        </div>
      </header>

      <main class="admin-body">
        <div class="admin-body-inner">
          <router-view />
        </div>
      </main>
    </div>

    <el-drawer
      v-model="drawerOpen"
      direction="ltr"
      size="280px"
      class="admin-drawer"
      :with-header="false"
    >
      <div class="drawer-inner">
        <div class="drawer-head">
          <span class="brand-title">管理后台</span>
          <el-button :icon="Close" circle size="small" aria-label="关闭" @click="drawerOpen = false" />
        </div>
        <div class="drawer-menu-wrap">
          <AdminMenu @select="drawerOpen = false" />
        </div>
        <div class="drawer-footer">
          <el-button class="drawer-foot-btn" @click="router.push('/'); drawerOpen = false">
            返回前台
          </el-button>
          <el-button type="danger" plain class="drawer-foot-btn" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessageBox } from 'element-plus';
import { Menu, Close, Monitor, SwitchButton } from '@element-plus/icons-vue';
import AdminMenu from './AdminMenu.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const drawerOpen = ref(false);
const windowW = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

const isCompact = computed(() => windowW.value < 768);

const pageMap: Record<string, string> = {
  '/admin': '仪表盘',
  '/admin/users': '用户管理',
  '/admin/statistics': '数据统计',
  '/admin/settings': '系统设置',
  '/admin/logs': '操作日志'
};

const currentPage = computed(() => pageMap[route.path] || '仪表盘');

function onResize() {
  windowW.value = window.innerWidth;
  if (windowW.value >= 768) drawerOpen.value = false;
}

onMounted(() => {
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

async function handleLogout() {
  drawerOpen.value = false;
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' });
  await authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-shell {
  --admin-primary: #3d9b8c;
  --admin-bg: #eef4f2;
  --admin-surface: #ffffff;
  --admin-border: rgba(61, 155, 140, 0.12);
  --admin-text: #1c2d2a;
  --admin-muted: #6b7f7a;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--admin-bg);
  color: var(--admin-text);
}

.admin-sidebar {
  display: none;
  flex-direction: column;
  width: 232px;
  flex-shrink: 0;
  background: var(--admin-surface);
  border-right: 1px solid var(--admin-border);
  box-shadow: 4px 0 24px rgba(28, 45, 42, 0.04);
}

.sidebar-menu-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.sidebar-brand {
  padding: 20px 18px 12px;
  border-bottom: 1px solid var(--admin-border);
  flex-shrink: 0;
}

.brand-title {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--admin-text);
  letter-spacing: -0.02em;
}

.brand-sub {
  display: block;
  font-size: 0.75rem;
  color: var(--admin-muted);
  margin-top: 4px;
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px;
  border-top: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.sidebar-link {
  justify-content: flex-start;
  width: 100%;
  min-height: 44px;
  color: var(--admin-muted);
}

.sidebar-link.logout {
  color: #c45c5c;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0px));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--admin-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-trigger {
  flex-shrink: 0;
}

.header-titles {
  flex: 1;
  min-width: 0;
}

.breadcrumb {
  font-size: 0.85rem;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: var(--admin-muted);
  font-weight: 400;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--admin-text);
  font-weight: 600;
}

.page-heading {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--admin-text);
}

.page-meta {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--admin-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.desktop-nick {
  font-size: 0.85rem;
  color: var(--admin-muted);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-link {
  min-height: 40px;
}

.admin-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.admin-body-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px;
  border-bottom: 1px solid var(--admin-border);
}

.drawer-footer {
  flex-shrink: 0;
  padding: 12px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--admin-surface);
  border-top: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-foot-btn {
  width: 100%;
  min-height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Mobile-first: show compact header */
.nav-trigger {
  display: inline-flex;
}

.breadcrumb,
.page-meta,
.desktop-nick {
  display: none;
}

.page-heading {
  display: block;
}

.header-actions .action-link {
  display: none;
}

@media (min-width: 768px) {
  .admin-sidebar {
    display: flex;
  }

  .nav-trigger {
    display: none;
  }

  .breadcrumb,
  .page-meta,
  .desktop-nick {
    display: block;
  }

  .page-heading {
    display: none;
  }

  .header-actions .action-link {
    display: inline-flex;
  }

  .admin-header {
    padding: 14px 24px;
    flex-wrap: nowrap;
  }

  .admin-body-inner {
    padding: 24px;
  }

  .sidebar-footer {
    display: none;
  }
}

</style>

<style>
/* Teleported drawer */
.admin-drawer .el-drawer__body {
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.admin-drawer .drawer-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.admin-drawer .drawer-menu-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* Dark theme variables for admin shell */
html.dark .admin-shell {
  --admin-primary: #4db5a5;
  --admin-bg: #0d1117;
  --admin-surface: #161b22;
  --admin-border: #30363d;
  --admin-text: #e6edf3;
  --admin-muted: #7d8590;
}

html.dark .admin-header {
  background: rgba(22, 27, 34, 0.92);
}
</style>
