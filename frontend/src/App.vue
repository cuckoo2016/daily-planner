<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { applyTheme, watchSystemTheme } from './utils/theme';

const authStore = useAuthStore();
let unwatchSystemTheme: (() => void) | null = null;

onMounted(async () => {
  // Initialize auth state from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let userTheme: 'light' | 'dark' | 'system' = 'system';

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      authStore.token = token;
      authStore.user = user;
      if (user.theme) {
        userTheme = user.theme;
      }
    } catch {
      // Invalid stored data
    }
  }

  // Initialize theme - use user.theme from database (stored in user object) or default to 'system'
  applyTheme(userTheme);

  // Watch system theme changes
  unwatchSystemTheme = watchSystemTheme(() => {
    if (authStore.user?.theme === 'system') {
      applyTheme('system');
    }
  });
});

onUnmounted(() => {
  if (unwatchSystemTheme) {
    unwatchSystemTheme();
  }
});
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>