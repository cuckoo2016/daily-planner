<template>
  <div class="profile">
    <div class="hero surface">
      <el-avatar class="hero-avatar" :size="72" :src="userInfo.avatar || defaultAvatar">
        {{ userInfo.nickname?.charAt(0) || '?' }}
      </el-avatar>
      <div class="hero-text">
        <div class="hero-name">{{ userInfo.nickname || '未设置昵称' }}</div>
        <div class="hero-sub">@{{ userInfo.username }}</div>
        <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'" size="small" round class="role-tag">
          {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
        </el-tag>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">{{ stats.totalPlans }}</div>
        <div class="stat-label">累计计划</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ stats.completedPlans }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ stats.useDays }}</div>
        <div class="stat-label">使用天数</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ stats.completionRate }}%</div>
        <div class="stat-label">完成率</div>
      </div>
    </div>

    <div class="surface section">
      <div class="section-title">账号</div>
      <div class="cell">
        <span class="cell-label">昵称</span>
        <el-input
          v-model="userInfo.nickname"
          class="cell-input"
          placeholder="昵称"
          @blur="saveProfile"
        />
      </div>
      <div class="cell readonly">
        <span class="cell-label">用户名</span>
        <span class="cell-value">{{ userInfo.username }}</span>
      </div>
    </div>

    <div class="surface section">
      <div class="section-title">外观</div>
      <div class="cell theme-cell">
        <span class="cell-label">主题</span>
        <el-radio-group v-model="userInfo.theme" size="small" @change="saveTheme">
          <el-radio-button label="light">浅色</el-radio-button>
          <el-radio-button label="dark">深色</el-radio-button>
          <el-radio-button label="system">系统</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="surface section">
      <div class="section-title">安全</div>
      <button type="button" class="cell linklike" @click="showPasswordDialog = true">
        <span class="cell-label">修改密码</span>
        <el-icon class="chev"><ArrowRight /></el-icon>
      </button>
    </div>

    <div v-if="authStore.isAdmin" class="surface section">
      <div class="section-title">管理</div>
      <router-link to="/admin" class="cell linklike admin-entry">
        <span class="cell-label">进入管理后台</span>
        <el-icon class="chev"><ArrowRight /></el-icon>
      </router-link>
    </div>

    <button type="button" class="logout-btn" @click="handleLogout">退出登录</button>

    <el-dialog v-model="showPasswordDialog" title="修改密码" width="min(400px, 92vw)" align-center>
      <el-form :model="passwordForm" label-position="top">
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';
import { getProfile, updateProfile, updateTheme, getStats, changePassword as changePwd } from '../../api/user';
import { useAuthStore } from '../../stores/auth';
import { applyTheme } from '../../utils/theme';

const router = useRouter();
const authStore = useAuthStore();
const defaultAvatar = '';

const userInfo = reactive({ username: '', nickname: '', avatar: '', role: '', theme: 'system' });
const stats = ref({
  totalPlans: 0,
  completedPlans: 0,
  useDays: 0,
  completionRate: 0,
  todayTotal: 0,
  todayCompleted: 0
});
const showPasswordDialog = ref(false);
const passwordForm = reactive({ oldPassword: '', newPassword: '' });

async function loadProfile() {
  try {
    const data = await getProfile();
    Object.assign(userInfo, data.user);
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

async function loadStats() {
  try {
    const data = await getStats();
    stats.value = data.stats;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

async function saveProfile() {
  try {
    await updateProfile({ nickname: userInfo.nickname });
    ElMessage.success('保存成功');
    if (authStore.user) authStore.user.nickname = userInfo.nickname;
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
}

async function saveTheme() {
  try {
    await updateTheme(userInfo.theme);
    applyTheme(userInfo.theme as 'light' | 'dark' | 'system');
    // Update auth store user
    if (authStore.user) {
      authStore.user.theme = userInfo.theme;
      localStorage.setItem('user', JSON.stringify(authStore.user));
    }
    ElMessage.success('主题已更新');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
}

async function changePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写完整');
    return;
  }
  try {
    await changePwd(passwordForm.oldPassword, passwordForm.newPassword);
    ElMessage.success('密码修改成功');
    showPasswordDialog.value = false;
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
  } catch (error: any) {
    ElMessage.error(error.message || '修改失败');
  }
}

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' });
  await authStore.logout();
  router.push('/login');
}

onMounted(() => {
  if (authStore.user) {
    Object.assign(userInfo, authStore.user);
  }
  loadProfile();
  loadStats();
});
</script>

<style scoped>
.profile {
  --accent: #3d9b8c;
  padding-bottom: 8px;
}

.surface {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
  border: 1px solid rgba(61, 155, 140, 0.08);
}

.hero {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 18px;
  margin-bottom: 14px;
}

.hero-avatar {
  flex-shrink: 0;
  font-size: 1.5rem;
  background: linear-gradient(145deg, #4db5a5, #3d9b8c);
  color: #fff;
}

.hero-text {
  min-width: 0;
}

.hero-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1c2d2a;
}

.hero-sub {
  font-size: 0.85rem;
  color: #6b7f7a;
  margin-top: 4px;
}

.role-tag {
  margin-top: 10px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
  padding: 0;
}

.stat {
  padding: 16px 12px;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
  border: 1px solid rgba(61, 155, 140, 0.08);
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7f7a;
  margin-top: 6px;
}

.section {
  margin-bottom: 14px;
  padding: 6px 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7f7a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 12px 18px 8px;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  min-height: 52px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: pointer;
  border-top: 1px solid rgba(61, 155, 140, 0.08);
}

.cell.readonly {
  cursor: default;
}

.cell-label {
  font-size: 0.95rem;
  color: #1c2d2a;
  flex-shrink: 0;
}

.cell-value {
  font-size: 0.9rem;
  color: #6b7f7a;
  word-break: break-all;
  text-align: right;
}

.cell-input {
  flex: 1;
  max-width: 200px;
}

.cell-input :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.theme-cell {
  flex-wrap: wrap;
  cursor: default;
}

.theme-cell .el-radio-group {
  flex: 1;
  justify-content: flex-end;
}

.linklike {
  text-decoration: none;
  color: inherit;
}

.chev {
  color: #b0c4bf;
  flex-shrink: 0;
}

.admin-entry {
  color: var(--accent);
  font-weight: 500;
}

.logout-btn {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 14px 18px;
  font-size: 1rem;
  font-weight: 600;
  color: #c45c5c;
  background: #fff;
  border: 1px solid rgba(196, 92, 92, 0.25);
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(28, 45, 42, 0.05);
}

.logout-btn:active {
  transform: scale(0.99);
}

@media (min-width: 480px) {
  .stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
