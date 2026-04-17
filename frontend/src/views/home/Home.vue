<template>
  <div class="home">
    <div class="progress-card surface">
      <div class="progress-info">
        <span class="label">今日进度</span>
        <span class="percentage">{{ completionRate }}%</span>
      </div>
      <el-progress
        :percentage="completionRate"
        :stroke-width="10"
        :show-text="false"
        color="var(--accent, #3d9b8c)"
      />
      <div class="progress-stats">{{ completedCount }} / {{ totalCount }} 已完成</div>
    </div>

    <div class="plans-card surface">
      <div class="card-header">
        <span class="card-title">今日计划</span>
      </div>

      <div v-if="plans.length === 0" class="empty">
        <el-empty description="今天还没有计划，点右下角添加一条吧～" />
      </div>

      <div v-else class="plan-list">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-item"
          :class="{ completed: plan.is_completed }"
        >
          <el-checkbox
            class="plan-check"
            :model-value="plan.is_completed === 1"
            @change="toggleComplete(plan)"
          />
          <div class="plan-content" @click="openEditDialog(plan)">
            <div class="plan-text">{{ plan.content }}</div>
            <div v-if="plan.reminder_time" class="plan-reminder">
              <el-icon><Bell /></el-icon>{{ plan.reminder_time }}
            </div>
          </div>
          <el-button
            type="danger"
            link
            class="plan-del"
            :icon="Delete"
            @click.stop="handleDelete(plan.id)"
          />
        </div>
      </div>
    </div>

    <el-button class="fab" type="primary" circle size="large" @click="showAddDialog = true">
      <el-icon :size="24"><Plus /></el-icon>
    </el-button>

    <el-dialog
      v-model="showAddDialog"
      :title="editingPlan ? '编辑计划' : '添加计划'"
      class="plan-sheet"
      :width="dialogWidth"
      align-center
      destroy-on-close
    >
      <el-form :model="planForm" label-position="top">
        <el-form-item label="计划内容">
          <el-input
            v-model="planForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入今日计划..."
          />
        </el-form-item>
        <el-form-item label="提醒时间（可选）">
          <el-time-picker
            v-model="planForm.reminder_time"
            placeholder="选择时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer-btns">
          <el-button @click="closeDialog">取消</el-button>
          <el-button v-if="editingPlan" type="danger" plain @click="confirmDelete">删除</el-button>
          <el-button type="primary" @click="savePlan">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Bell, Delete } from '@element-plus/icons-vue';
import {
  getPlans,
  createPlan,
  updatePlan,
  toggleComplete as togglePlanComplete,
  deletePlan,
  type Plan
} from '../../api/plans';

const plans = ref<Plan[]>([]);
const showAddDialog = ref(false);
const editingPlan = ref<Plan | null>(null);
const planForm = reactive({ content: '', reminder_time: '' });

const dialogWidth = computed(() => {
  if (typeof window === 'undefined') return '480px';
  return window.matchMedia('(max-width: 600px)').matches ? '100%' : '480px';
});

const totalCount = computed(() => plans.value.length);
const completedCount = computed(() => plans.value.filter((p) => p.is_completed === 1).length);
const completionRate = computed(() =>
  totalCount.value === 0 ? 0 : Math.round((completedCount.value / totalCount.value) * 100)
);

async function loadPlans() {
  try {
    const data = await getPlans();
    plans.value = data.plans;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  }
}

function openEditDialog(plan: Plan) {
  editingPlan.value = plan;
  planForm.content = plan.content;
  planForm.reminder_time = plan.reminder_time || '';
  showAddDialog.value = true;
}

function closeDialog() {
  showAddDialog.value = false;
  editingPlan.value = null;
  planForm.content = '';
  planForm.reminder_time = '';
}

async function savePlan() {
  if (!planForm.content.trim()) {
    ElMessage.warning('请输入计划内容');
    return;
  }
  try {
    if (editingPlan.value) {
      await updatePlan(editingPlan.value.id, planForm);
      ElMessage.success('更新成功');
    } else {
      await createPlan(planForm);
      ElMessage.success('添加成功');
    }
    closeDialog();
    loadPlans();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

async function toggleComplete(plan: Plan) {
  try {
    await togglePlanComplete(plan.id, plan.is_completed !== 1);
    loadPlans();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

async function confirmDelete() {
  if (!editingPlan.value) return;
  await handleDelete(editingPlan.value.id);
  closeDialog();
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定要删除这条计划吗？删除后不可恢复', '提示', { type: 'warning' });
  try {
    await deletePlan(id);
    ElMessage.success('删除成功');
    loadPlans();
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败');
  }
}

onMounted(loadPlans);
</script>

<style scoped>
.home {
  --accent: #3d9b8c;
  position: relative;
  padding-bottom: 72px;
}

.surface {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
  border: 1px solid rgba(61, 155, 140, 0.08);
}

.progress-card {
  padding: 18px 18px 16px;
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}

.label {
  color: #6b7f7a;
  font-size: 0.9rem;
}

.percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.progress-stats {
  text-align: right;
  color: #8a9a95;
  margin-top: 8px;
  font-size: 0.8rem;
}

.plans-card {
  padding: 16px 16px 18px;
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1c2d2a;
}

.empty {
  padding: 24px 0 8px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 12px;
  background: #f6faf9;
  border-radius: 14px;
  border: 1px solid rgba(61, 155, 140, 0.06);
  transition: background 0.15s ease;
}

.plan-item.completed .plan-text {
  text-decoration: line-through;
  color: #8a9a95;
}

.plan-check {
  margin-top: 2px;
}

.plan-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  padding: 2px 0;
  min-height: 44px;
}

.plan-text {
  font-size: 1rem;
  line-height: 1.45;
  word-break: break-word;
}

.plan-reminder {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--accent);
  font-size: 0.8rem;
  margin-top: 6px;
}

.plan-del {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
}

.fab {
  position: fixed;
  right: 16px;
  bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  z-index: 25;
  width: 56px !important;
  height: 56px !important;
  box-shadow: 0 8px 28px rgba(61, 155, 140, 0.35);
  background: linear-gradient(145deg, #4db5a5, #3d9b8c) !important;
  border: none !important;
}

@media (min-width: 768px) {
  .fab {
    right: calc(50% - 320px + 16px);
  }
}

.dialog-footer-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  width: 100%;
}
</style>

<style>
/* Dialog: bottom sheet on narrow screens */
@media (max-width: 600px) {
  .plan-sheet.el-dialog {
    margin: 0 auto !important;
    position: fixed !important;
    bottom: 0 !important;
    top: auto !important;
    transform: none !important;
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px 20px 0 0 !important;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .plan-sheet .el-dialog__body {
    padding-top: 8px;
  }
}
</style>
