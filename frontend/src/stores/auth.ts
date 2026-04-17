import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
  type User
} from '../api/auth';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || '');
  const refreshToken = ref(localStorage.getItem('refreshToken') || '');
  const user = ref<User | null>(null);

  const isLoggedIn = computed(() => !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function init() {
    if (accessToken.value) {
      try {
        const data = await getCurrentUser();
        user.value = data.user;
      } catch {
        logout();
      }
    }
  }

  async function login(username: string, password: string) {
    const data = await apiLogin({ username, password });
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    user.value = data.user;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async function register(username: string, password: string, nickname?: string) {
    const data = await apiRegister({ username, password, nickname });
    // Also auto-login after register
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    user.value = data.user;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async function logout() {
    try {
      await apiLogout(refreshToken.value || undefined);
    } catch {
      // ignore
    }
    accessToken.value = '';
    refreshToken.value = '';
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    isAdmin,
    init,
    login,
    register,
    logout
  };
});
