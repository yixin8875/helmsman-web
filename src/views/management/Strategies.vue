<template>
  <div class="page">
    <div class="page-header">
      <el-button type="primary" @click="openCreateDialog" round>+ 新建策略</el-button>
    </div>
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="策略名称" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="240" />
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
    <div class="table-footer">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑策略' : '新建策略'" width="520px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="96px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="form.description" placeholder="策略描述（可选）" :rows="4" />
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
import { getStrategyList, createStrategy, updateStrategy, deleteStrategy } from '@/api/strategy'
import type { Strategy } from '@/types/trade'

const loading = ref(false)
const list = ref<Strategy[]>([])

// 新增分页状态
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const formRef = ref()
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = ref<Pick<Strategy, 'name' | 'description'>>({ name: '', description: '' })

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  description: [{ required: false, trigger: 'blur' }]
}

// 覆盖 fetchList 以支持分页 POST /strategies/list
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getStrategyList({ page: page.value - 1, limit: pageSize.value })
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

// 删除保持成功码兼容
const onDelete = async (row: Strategy) => {
  try {
    await ElMessageBox.confirm(`确认删除策略 “${row.name}” 吗？`, '提示', { type: 'warning' })
    const res = await deleteStrategy(row.id)
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

const openCreateDialog = () => {
  editingId.value = null
  form.value = { name: '', description: '' }
  dialogVisible.value = true
}

const openEditDialog = (row: Strategy) => {
  editingId.value = row.id
  form.value = { name: row.name, description: row.description || '' }
  dialogVisible.value = true
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (editingId.value) {
      const res = await updateStrategy(editingId.value, { ...form.value })
      if (res.code === 0 || res.code === 200) ElMessage.success('更新成功')
    } else {
      const res = await createStrategy({ ...form.value })
      if (res.code === 0 || res.code === 200) ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await fetchList()
  } catch (e) {} finally {
    submitLoading.value = false
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
</style>