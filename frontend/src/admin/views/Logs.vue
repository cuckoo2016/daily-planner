<template>
  <div class="logs">
    <div class="toolbar surface">
      <el-input
        v-model="actionFilter"
        placeholder="搜索操作类型..."
        clearable
        class="tool-search"
        @input="() => loadLogs(1)"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始"
        end-placeholder="结束"
        class="tool-date"
        value-format="YYYY-MM-DD"
        :unlink-panels="true"
        @change="loadLogs"
      />
    </div>

    <div class="table-card surface">
      <div class="table-wrap">
        <el-table :data="logs" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="64" />
          <el-table-column prop="username" label="操作人" min-width="100" />
          <el-table-column prop="action" label="操作类型" min-width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.action }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="target_type" label="对象" width="100" />
          <el-table-column prop="details" label="详情" min-width="160" :show-overflow-tooltip="true" />
          <el-table-column prop="ip_address" label="IP" min-width="120" />
          <el-table-column prop="created_at" label="时间" min-width="160">
            <template #default="{ row }">
              {{ new Date(row.created_at).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-pagination
      v-if="total > pageSize"
      class="pager"
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="loadLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getLogs } from '../../api/admin';

const loading = ref(false);
const logs = ref<any[]>([]);
const total = ref(0);
const pageSize = 10;
const currentPage = ref(1);
const actionFilter = ref('');
const dateRange = ref<[string, string] | null>(null);

async function loadLogs(page = 1) {
  currentPage.value = page;
  loading.value = true;
  try {
    const params: any = { page, pageSize };
    if (actionFilter.value) params.action = actionFilter.value;
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }
    const data = await getLogs(params);
    logs.value = data.logs;
    total.value = data.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

onMounted(loadLogs);
</script>

<style scoped>
.surface {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(61, 155, 140, 0.1);
  box-shadow: 0 4px 20px rgba(28, 45, 42, 0.06);
}

.toolbar {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-search {
  width: 100%;
}

.tool-date {
  width: 100%;
  max-width: 100%;
}

.tool-date :deep(.el-date-editor) {
  width: 100%;
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-wrap :deep(.el-table) {
  --el-table-border-color: rgba(61, 155, 140, 0.1);
}

.pager {
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 767px) {
  .toolbar {
    flex-direction: column;
  }

  .tool-date :deep(.el-range-separator) {
    padding: 0 4px;
  }

  .tool-date :deep(.el-range-input) {
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }

  .tool-search {
    flex: 1;
    min-width: 200px;
    max-width: 280px;
  }

  .tool-date {
    width: auto;
    flex: 1;
    min-width: 260px;
    max-width: 400px;
  }
}
</style>

<style>
.tool-date {
  width: 100%;
  max-width: 100%;
}

.tool-date :deep(.el-date-editor) {
  width: 100%;
}
</style>
