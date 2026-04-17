<template>
  <div class="settings">
    <div class="card surface">
      <div class="card-title">基础设置</div>
      <el-form label-position="top" class="settings-form">
        <el-form-item label="网站名称">
          <el-input v-model="settings.site_name" placeholder="网站名称" />
        </el-form-item>
        <el-form-item label="允许新用户注册">
          <el-switch v-model="allowRegister" size="large" />
        </el-form-item>
        <el-form-item label="默认用户角色">
          <el-select v-model="settings.default_role" style="width: 100%; max-width: 320px">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="card surface">
      <div class="card-title">安全设置</div>
      <el-form label-position="top" class="settings-form">
        <el-form-item label="Token 有效期（小时）">
          <el-input-number v-model="tokenHours" :min="1" :max="168" style="width: 100%; max-width: 200px" />
        </el-form-item>
        <el-form-item label="允许多设备登录">
          <el-switch v-model="allowMultiLogin" size="large" />
        </el-form-item>
      </el-form>
    </div>

    <div class="card surface">
      <div class="card-title">提醒设置</div>
      <el-form label-position="top" class="settings-form">
        <el-form-item label="默认提醒开启">
          <el-switch v-model="defaultReminderEnabled" size="large" />
        </el-form-item>
      </el-form>
    </div>

    <div class="save-row">
      <el-button type="primary" size="large" class="save-btn" @click="saveSettings">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { getSettings, updateSettings } from '../../api/admin';

const settings = reactive<Record<string, string>>({});

const allowRegister = computed({
  get: () => settings.allow_register === 'true',
  set: (v) => (settings.allow_register = String(v))
});
const allowMultiLogin = computed({
  get: () => settings.allow_multi_login === 'true',
  set: (v) => (settings.allow_multi_login = String(v))
});
const defaultReminderEnabled = computed({
  get: () => settings.default_reminder_enabled === 'true',
  set: (v) => (settings.default_reminder_enabled = String(v))
});
const tokenHours = computed({
  get: () => Number(settings.token_expires_hours) || 24,
  set: (v) => (settings.token_expires_hours = String(v))
});

async function loadSettings() {
  try {
    const data = await getSettings();
    Object.assign(settings, data.settings);
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

async function saveSettings() {
  try {
    await updateSettings(settings);
    ElMessage.success('保存成功');
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
}

onMounted(loadSettings);
</script>

<style scoped>
.surface {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(61, 155, 140, 0.1);
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
}

.card {
  padding: 18px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1c2d2a;
}

.settings-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.settings-form :deep(.el-input__wrapper),
.settings-form :deep(.el-input-number) {
  border-radius: 12px;
}

.save-row {
  margin-top: 8px;
}

.save-btn {
  width: 100%;
  max-width: 320px;
  border-radius: 14px;
  background: linear-gradient(145deg, #4db5a5, #3d9b8c) !important;
  border: none !important;
}

@media (min-width: 480px) {
  .save-btn {
    width: auto;
    min-width: 200px;
  }
}
</style>
