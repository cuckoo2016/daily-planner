import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      component: () => import('../views/home/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/home/Home.vue')
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('../views/home/History.vue')
        },
        {
          path: 'reminders',
          name: 'reminders',
          component: () => import('../views/home/Reminders.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/home/Profile.vue')
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../admin/layout/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../admin/views/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../admin/views/UserManage.vue')
        },
        {
          path: 'statistics',
          name: 'admin-statistics',
          component: () => import('../admin/views/Statistics.vue')
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../admin/views/SystemSettings.vue')
        },
        {
          path: 'logs',
          name: 'admin-logs',
          component: () => import('../admin/views/Logs.vue')
        }
      ]
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state
  if (!authStore.user && authStore.token) {
    await authStore.init();
  }

  const isGuest = to.meta.guest;
  const requiresAuth = to.meta.requiresAuth;
  const requiresAdmin = to.meta.requiresAdmin;

  if (requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (isGuest && authStore.isLoggedIn) {
    next({ name: 'home' });
  } else if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;