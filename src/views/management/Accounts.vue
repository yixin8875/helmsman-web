<template>
  <div class="page">
    <div class="page-header">
      <el-button type="primary" @click="openCreateDialog" round>+ 新建账户</el-button>
    </div>
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="账户名称" min-width="160" />
        <el-table-column prop="initial_balance" label="初始余额" min-width="160" />
        <el-table-column prop="currency" label="币种" min-width="120" />
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 新增分页 -->
      <div class="table-footer">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑账户' : '新建账户'" width="480px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="96px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="初始余额" prop="initial_balance">
          <el-input-number v-model="form.initial_balance" :min="0" :precision="2" :step="100" :controls="false" placeholder="请输入初始余额" />
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-input v-model="form.currency" placeholder="例如：USD / USDT" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible=false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="onSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAccountList, createAccount, updateAccount, deleteAccount } from '@/api/account'
import type { Account } from '@/types/trade'

const loading = ref(false)
const list = ref<Account[]>([])
// 分页状态
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const formRef = ref()
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = ref<Pick<Account, 'name' | 'initial_balance' | 'currency'>>({
  name: '',
  initial_balance: 0,
  currency: ''
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  initial_balance: [{ required: true, message: '请输入初始余额', trigger: 'blur' }],
  currency: [{ required: true, message: '请输入币种', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getAccountList({ page: page.value - 1, limit: pageSize.value })
    list.value = res.data?.items || []
    total.value = res.data?.total ?? 0
  } finally {
    loading.value = false
  }
}

// 分页事件处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  fetchList()
}
const handleCurrentChange = (val: number) => {
  page.value = val
  fetchList()
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = { name: '', initial_balance: 0, currency: '' }
  dialogVisible.value = true
}

const openEditDialog = (row: Account) => {
  editingId.value = row.id
  form.value = {
    name: row.name,
    initial_balance: row.initial_balance,
    currency: row.currency
  }
  dialogVisible.value = true
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (editingId.value) {
      const res = await updateAccount(editingId.value, { ...form.value })
      if (res.code === 0 || res.code === 200) ElMessage.success('更新成功')
    } else {
      const res = await createAccount({ ...form.value })
      if (res.code === 0 || res.code === 200) ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await fetchList()
  } catch (e) {
    // ignore
  } finally {
    submitLoading.value = false
  }
}

const onDelete = async (row: Account) => {
  try {
    await ElMessageBox.confirm(`确认删除账户 “${row.name}” 吗？`, '提示', { type: 'warning' })
    const res = await deleteAccount(row.id)
    if (res.code === 0 || res.code === 200) {
      ElMessage.success('删除成功')
      await fetchList()
    }
  } catch (e) {}
}

const formatDate = (val?: string) => {
  if (!val) return '-'
  try {
    const d = new Date(val)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return val
  }
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page-header {
  display: flex;
  justify-content: flex-start;
}
.table-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>