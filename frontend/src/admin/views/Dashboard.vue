<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-icon" style="background: linear-gradient(145deg, #4db5a5, #3d9b8c)">
            <User />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-icon" style="background: linear-gradient(145deg, #7bc96f, #5aae4a)">
            <TrendCharts />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-icon" style="background: linear-gradient(145deg, #e8b86d, #d9a24a)">
            <List />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.todayPlans }}</div>
            <div class="stat-label">今日计划</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-icon" style="background: linear-gradient(145deg, #e88989, #d96b6b)">
            <Check />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dashboard.overallRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="row-tables">
      <el-col :xs="24" :lg="12">
        <div class="card surface">
          <div class="card-title">最近注册用户</div>
          <div class="table-wrap">
            <el-table :data="dashboard.recentUsers" size="small" stripe>
              <el-table-column prop="username" label="用户名" min-width="100" />
              <el-table-column prop="nickname" label="昵称" min-width="90" />
              <el-table-column prop="role" label="角色" width="88">
                <template #default="{ row }">
                  <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" size="small">{{
                    row.role
                  }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="card surface">
          <div class="card-title">最近计划</div>
          <div class="table-wrap">
            <el-table :data="dashboard.recentPlans" size="small" stripe>
              <el-table-column prop="username" label="用户" min-width="90" />
              <el-table-column prop="content" label="内容" min-width="120" :show-overflow-tooltip="true" />
              <el-table-column prop="is_completed" label="状态" width="88">
                <template #default="{ row }">
                  <el-tag :type="row.is_completed ? 'success' : 'info'" size="small">{{
                    row.is_completed ? '已完成' : '未完成'
                  }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, TrendCharts, List, Check } from '@element-plus/icons-vue';
import { getDashboard } from '../../api/admin';

const dashboard = ref<any>({
  totalUsers: 0,
  activeUsers: 0,
  todayPlans: 0,
  overallRate: 0,
  recentUsers: [],
  recentPlans: []
});

async function loadDashboard() {
  try {
    const data = await getDashboard();
    dashboard.value = data.dashboard;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

onMounted(loadDashboard);
</script>

<style scoped>
.dashboard {
  --accent: #3d9b8c;
}

.surface {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(61, 155, 140, 0.1);
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 18px;
  margin-bottom: 16px;
}

@media (min-width: 1200px) {
  .stat-card {
    margin-bottom: 0;
  }
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
  margin-right: 14px;
  flex-shrink: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c2d2a;
}

.stat-label {
  color: #6b7f7a;
  margin-top: 4px;
  font-size: 0.85rem;
}

.row-tables {
  margin-top: 0;
}

@media (min-width: 992px) {
  .row-tables {
    margin-top: 8px;
  }
}

.card {
  padding: 18px;
  margin-bottom: 16px;
}

@media (min-width: 992px) {
  .card {
    margin-bottom: 0;
  }
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 14px;
  color: #1c2d2a;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
}

.table-wrap :deep(.el-table) {
  --el-table-border-color: rgba(61, 155, 140, 0.1);
}
</style>
