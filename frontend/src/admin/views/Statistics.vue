<template>
  <div class="statistics">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-value">{{ stats.users?.total || 0 }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-value">{{ stats.users?.active || 0 }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-value">{{ stats.plans?.total || 0 }}</div>
          <div class="stat-label">总计划数</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stat-card surface">
          <div class="stat-value">{{ stats.plans?.completionRate || 0 }}%</div>
          <div class="stat-label">完成率</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="row-cards">
      <el-col :xs="24" :lg="12">
        <div class="card surface">
          <div class="card-title">用户增长趋势</div>
          <div v-if="!stats.userTrend?.length" class="empty-tip">暂无数据</div>
          <div v-else class="trend-list">
            <div v-for="item in stats.userTrend" :key="item.date" class="trend-item">
              <span class="date">{{ item.date }}</span>
              <span class="count">新增 {{ item.count }} 人</span>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="card surface">
          <div class="card-title">计划创建趋势</div>
          <div v-if="!stats.planTrend?.length" class="empty-tip">暂无数据</div>
          <div v-else class="trend-list">
            <div v-for="item in stats.planTrend" :key="item.date" class="trend-item">
              <span class="date">{{ item.date }}</span>
              <span class="count">创建 {{ item.count }} 条</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getStatistics } from '../../api/admin';

const stats = ref<any>({});

async function loadStats() {
  try {
    const data = await getStatistics();
    stats.value = data.statistics;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

onMounted(loadStats);
</script>

<style scoped>
.statistics {
  --accent: #3d9b8c;
}

.surface {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(61, 155, 140, 0.1);
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
}

.stat-card {
  text-align: center;
  padding: 20px 16px;
  margin-bottom: 16px;
}

@media (min-width: 1200px) {
  .stat-card {
    margin-bottom: 0;
  }
}

.stat-value {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  color: #6b7f7a;
  margin-top: 8px;
  font-size: 0.85rem;
}

.row-cards {
  margin-top: 0;
}

@media (min-width: 992px) {
  .row-cards {
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

.empty-tip {
  text-align: center;
  color: #8a9a95;
  padding: 36px 16px;
  font-size: 0.9rem;
}

.trend-list {
  max-height: min(320px, 50vh);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(61, 155, 140, 0.1);
  font-size: 0.9rem;
}

.trend-item:last-child {
  border-bottom: none;
}

.trend-item .date {
  color: #1c2d2a;
}

.trend-item .count {
  color: var(--accent);
  font-weight: 500;
  flex-shrink: 0;
}
</style>
