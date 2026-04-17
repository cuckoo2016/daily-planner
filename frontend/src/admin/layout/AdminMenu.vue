<template>
  <el-menu
    :default-active="route.path"
    router
    class="admin-menu"
    @select="onSelect"
  >
    <el-menu-item index="/admin">
      <el-icon><DataAnalysis /></el-icon>
      <span>仪表盘</span>
    </el-menu-item>
    <el-menu-item index="/admin/users">
      <el-icon><User /></el-icon>
      <span>用户管理</span>
    </el-menu-item>
    <el-menu-item index="/admin/statistics">
      <el-icon><TrendCharts /></el-icon>
      <span>数据统计</span>
    </el-menu-item>
    <el-menu-item index="/admin/settings">
      <el-icon><Setting /></el-icon>
      <span>系统设置</span>
    </el-menu-item>
    <el-menu-item index="/admin/logs">
      <el-icon><Document /></el-icon>
      <span>操作日志</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { DataAnalysis, User, TrendCharts, Setting, Document } from '@element-plus/icons-vue';

const route = useRoute();

const emit = defineEmits<{ select: [] }>();

function onSelect() {
  emit('select');
}
</script>

<style scoped>
.admin-menu {
  border-right: none;
  background: transparent;
  padding: 8px 0;
}

.admin-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 10px;
  border-radius: 12px;
  color: #4a5f5a;
}

.admin-menu :deep(.el-menu-item:hover) {
  background: rgba(61, 155, 140, 0.08);
}

.admin-menu :deep(.el-menu-item.is-active) {
  background: rgba(61, 155, 140, 0.14);
  color: #3d9b8c;
  font-weight: 600;
}
</style>

<style>
.el-button+.el-button {
  margin-left: 0px;
}
</style>