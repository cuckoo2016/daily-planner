<template>
  <div class="history">
    <div class="toolbar surface">
      <el-input
        v-model="keyword"
        placeholder="搜索计划内容..."
        clearable
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <el-radio-group v-model="dateRange" class="range-group" size="default" @change="() => loadHistory(1)">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="7">近7天</el-radio-button>
        <el-radio-button label="30">近30天</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="loading" class="loading">
      <el-icon class="is-loading" size="32"><Loading /></el-icon>
    </div>

    <div v-else-if="historyList.length === 0" class="empty surface">
      <el-empty description="暂无历史计划记录" />
    </div>

    <div v-else class="timeline">
      <template v-for="group in groupedHistory" :key="group.monthKey">
        <div class="month-label">{{ group.monthLabel }}</div>
        <div class="history-list">
          <div
            v-for="item in group.items"
            :key="item.plan_date"
            class="history-item surface"
            @click="viewDetail(item)"
          >
            <div class="timeline-dot" aria-hidden="true" />
            <div class="history-body">
              <div class="date-row">
                <span class="date">{{ formatDate(item.plan_date) }}</span>
                <span class="rate">{{ Math.round((item.completed / item.total) * 100) || 0 }}% 完成</span>
              </div>
              <div class="plan-count">{{ item.total }} 条计划</div>
            </div>
            <el-icon class="chev"><ArrowRight /></el-icon>
          </div>
        </div>
      </template>
    </div>

    <el-pagination
      v-if="total > pageSize && !keyword"
      class="pager"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="loadHistory"
    />

    <el-dialog
      v-model="showDetail"
      :title="detailDate + ' 计划'"
      class="history-detail-dialog"
      width="min(520px, 100%)"
      align-center
    >
      <div v-if="detailPlans.length === 0" class="detail-empty">当日无计划</div>
      <div v-else class="detail-list">
        <div
          v-for="plan in detailPlans"
          :key="plan.id"
          class="detail-item"
          :class="{ completed: plan.is_completed }"
        >
          <el-checkbox :model-value="plan.is_completed === 1" disabled />
          <span>{{ plan.content }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, ArrowRight, Loading } from '@element-plus/icons-vue';
import { getHistoryPlans, type Plan } from '../../api/plans';

const loading = ref(false);
const keyword = ref('');
const dateRange = ref('all');
const historyList = ref<any[]>([]);
const total = ref(0);
const pageSize = 10;
const currentPage = ref(1);

const showDetail = ref(false);
const detailDate = ref('');
const detailPlans = ref<Plan[]>([]);

const groupedHistory = computed(() => {
  const list = historyList.value;
  const map = new Map<string, { monthKey: string; monthLabel: string; items: any[] }>();

  for (const item of list) {
    const d = new Date(item.plan_date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    if (!map.has(monthKey)) {
      map.set(monthKey, { monthKey, monthLabel, items: [] });
    }
    map.get(monthKey)!.items.push(item);
  }

  return [...map.values()].sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
});

function formatDate(date: string) {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

async function loadHistory(page = 1) {
  currentPage.value = page;
  loading.value = true;
  try {
    const params: any = { page, pageSize };
    if (dateRange.value === '7') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      params.startDate = d.toISOString().split('T')[0];
    } else if (dateRange.value === '30') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      params.startDate = d.toISOString().split('T')[0];
    }
    const data = await getHistoryPlans(params);
    historyList.value = data.plans;
    total.value = data.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleSearch() {
  if (keyword.value) {
    loading.value = true;
    try {
      const { searchPlans } = await import('../../api/plans');
      const data = await searchPlans(keyword.value);
      historyList.value = data.plans.map((p: Plan) => ({
        plan_date: p.plan_date,
        total: 1,
        completed: p.is_completed
      }));
      total.value = data.total;
    } catch (error: any) {
      ElMessage.error(error.message || '搜索失败');
    } finally {
      loading.value = false;
    }
  } else {
    loadHistory();
  }
}

async function viewDetail(item: any) {
  detailDate.value = formatDate(item.plan_date);
  try {
    const { getPlans } = await import('../../api/plans');
    const data = await getPlans(item.plan_date);
    detailPlans.value = data.plans;
    showDetail.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || '加载详情失败');
  }
}

onMounted(loadHistory);
</script>

<style scoped>
.history {
  --accent: #3d9b8c;
}

.surface {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
  border: 1px solid rgba(61, 155, 140, 0.08);
}

.toolbar {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  width: 100%;
}

.range-group {
  display: flex;
  gap:5px;
  width: 100%;
}

.range-group :deep(.el-radio-button) {
  flex: 1;
}

.range-group :deep(.el-radio-button__inner) {
  width: 100%;
  padding: 10px 8px;
  border-radius: 12px !important;
  border: 1px solid rgba(61, 155, 140, 0.2) !important;
  box-shadow: none !important;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 48px;
  color: var(--accent);
}

.empty {
  padding: 32px 16px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.month-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7f7a;
  padding: 8px 4px 4px;
  letter-spacing: 0.02em;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 8px;
  border-left: 2px solid rgba(61, 155, 140, 0.2);
  margin-left: 10px;
}

.history-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 14px 12px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.history-item:active {
  transform: scale(0.99);
}

.timeline-dot {
  position: absolute;
  left: -21px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  border: 2px solid #f0f4f3;
}

.history-body {
  flex: 1;
  min-width: 0;
}

.date-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.date {
  font-size: 1rem;
  font-weight: 600;
  color: #1c2d2a;
}

.rate {
  font-size: 0.85rem;
  color: #3d9b8c;
  font-weight: 500;
}

.plan-count {
  font-size: 0.8rem;
  color: #8a9a95;
  margin-top: 4px;
}

.chev {
  color: #b0c4bf;
  flex-shrink: 0;
}

.pager {
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.detail-empty {
  text-align: center;
  color: #8a9a95;
  padding: 24px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(60vh, 400px);
  overflow-y: auto;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #f6faf9;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.45;
}

.detail-item.completed span {
  text-decoration: line-through;
  color: #8a9a95;
}
</style>

<style>
@media (max-width: 600px) {
  .history-detail-dialog.el-dialog {
    margin: 0 auto !important;
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 16px 16px 0 0 !important;
  }
}
</style>
