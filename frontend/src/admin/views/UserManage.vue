<template>
  <div class="user-manage">
    <div class="toolbar surface">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名或昵称..."
        clearable
        class="tool-search"
        @input="() => loadUsers(1)"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <div class="tool-filters">
        <el-select v-model="roleFilter" placeholder="角色" clearable class="tool-select" @change="() => loadUsers(1)">
          <el-option label="全部" value="" />
          <el-option label="普通用户" value="user" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态" clearable class="tool-select" @change="() => loadUsers(1)">
          <el-option label="全部" value="" />
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </div>
    </div>

    <div class="table-card surface">
      <div class="table-wrap">
        <el-table :data="users" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="64" />
          <el-table-column prop="username" label="用户名" min-width="100" />
          <el-table-column prop="nickname" label="昵称" min-width="90" />
          <el-table-column prop="role" label="角色" width="88">
            <template #default="{ row }">
              <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" size="small">{{
                row.role === 'admin' ? '管理员' : '用户'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{
                row.status === 1 ? '正常' : '禁用'
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="last_login_at" label="最后登录" min-width="160">
            <template #default="{ row }">
              {{ row.last_login_at ? new Date(row.last_login_at).toLocaleString() : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="注册时间" min-width="160">
            <template #default="{ row }">
              {{ new Date(row.created_at).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="168" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
              <el-button :type="row.status === 1 ? 'warning' : 'success'" link @click="toggleStatus(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      @current-change="loadUsers"
    />

    <el-dialog v-model="showEdit" title="编辑用户" width="min(500px, 94vw)" align-center>
      <el-form :model="editForm" label-position="top">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role" style="width: 100%">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getUsers, updateUser, toggleUserStatus, deleteUser } from '../../api/admin';

const loading = ref(false);
const users = ref<any[]>([]);
const total = ref(0);
const pageSize = 10;
const currentPage = ref(1);
const keyword = ref('');
const roleFilter = ref('');
const statusFilter = ref('');

const showEdit = ref(false);
const editForm = reactive({ id: 0, nickname: '', role: 'user' });

async function loadUsers(page = 1) {
  currentPage.value = page;
  loading.value = true;
  try {
    const data = await getUsers({
      keyword: keyword.value || undefined,
      role: roleFilter.value || undefined,
      status: statusFilter.value !== '' ? Number(statusFilter.value) : undefined,
      page,
      pageSize
    });
    users.value = data.users;
    total.value = data.total;
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function openEdit(user: any) {
  editForm.id = user.id;
  editForm.nickname = user.nickname;
  editForm.role = user.role;
  showEdit.value = true;
}

async function saveUser() {
  try {
    await updateUser(editForm.id, { nickname: editForm.nickname, role: editForm.role });
    ElMessage.success('保存成功');
    showEdit.value = false;
    loadUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败');
  }
}

async function toggleStatus(user: any) {
  const newStatus = user.status === 1 ? 0 : 1;
  try {
    await toggleUserStatus(user.id, newStatus);
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用');
    loadUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
}

async function handleDelete(user: any) {
  await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复`, '警告', {
    type: 'warning'
  });
  try {
    await deleteUser(user.id);
    ElMessage.success('删除成功');
    loadUsers();
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败');
  }
}

onMounted(loadUsers);
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

.tool-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tool-select {
  flex: 1;
  min-width: 120px;
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

@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }

  .tool-search {
    flex: 1;
    min-width: 220px;
    max-width: 360px;
  }

  .tool-filters {
    flex: 0 1 auto;
  }

  .tool-select {
    width: 140px;
    flex: 0 0 auto;
  }
}
</style>
