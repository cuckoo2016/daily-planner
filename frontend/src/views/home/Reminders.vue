<template>
  <div class="reminders">
    <div class="global-card surface">
      <div class="global-row">
        <div class="global-copy">
          <div class="global-title">全局提醒</div>
          <div class="global-desc">关闭后仅影响本地提示，不改变各计划的提醒时间</div>
        </div>
        <el-switch
          v-model="globalEnabled"
          size="large"
          active-text="开"
          inactive-text="关"
          inline-prompt
          @change="handleGlobalChange"
        />
      </div>
    </div>

    <div class="list-heading">今日已设时间的计划</div>

    <div v-if="plans.length === 0" class="empty surface">
      <el-empty description="今日暂无设置提醒的计划" />
    </div>

    <div v-else class="reminder-list">
      <div v-for="plan in plans" :key="plan.id" class="reminder-item surface">
        <div class="plan-info">
          <div class="plan-content">{{ plan.content }}</div>
          <div class="reminder-time">
            <el-icon><Bell /></el-icon>
            {{ plan.reminder_time }}
          </div>
        </div>
        <el-switch
          :model-value="plan.reminder_enabled === 1"
          size="large"
          @change="() => toggleReminder(plan)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Bell } from '@element-plus/icons-vue';
import { getPlans, updatePlan, type Plan } from '../../api/plans';

const globalEnabled = ref(true);
const plans = ref<Plan[]>([]);

async function loadPlans() {
  try {
    const data = await getPlans();
    plans.value = data.plans.filter((p) => p.reminder_time);
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

async function toggleReminder(plan: Plan) {
  try {
    const newValue = plan.reminder_enabled === 1 ? 0 : 1;
    await updatePlan(plan.id, { reminder_enabled: newValue === 1 });
    plan.reminder_enabled = newValue;
    ElMessage.success(newValue === 1 ? '提醒已开启' : '提醒已关闭');
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

function handleGlobalChange(enabled: boolean) {
  ElMessage.success(enabled ? '全局提醒已开启' : '全局提醒已关闭');
}

onMounted(loadPlans);
</script>

<style scoped>
.reminders {
  --accent: #3d9b8c;
}

.surface {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
  border: 1px solid rgba(61, 155, 140, 0.08);
}

.global-card {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.global-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.global-copy {
  flex: 1;
  min-width: 0;
}

.global-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1c2d2a;
}

.global-desc {
  font-size: 0.8rem;
  color: #6b7f7a;
  margin-top: 6px;
  line-height: 1.45;
}

.list-heading {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7f7a;
  margin-bottom: 10px;
  padding-left: 2px;
}

.empty {
  padding: 28px 16px;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  min-height: 72px;
}

.plan-info {
  flex: 1;
  min-width: 0;
}

.plan-content {
  font-size: 1rem;
  line-height: 1.45;
  color: #1c2d2a;
  word-break: break-word;
}

.reminder-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
