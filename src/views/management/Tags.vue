<template>
  <div class="page">
    <div class="page-header">
      <el-button type="primary" @click="openCreateDialog" round>+ 新建标签</el-button>
    </div>
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="标签名称" min-width="180" />
        <el-table-column label="颜色预览" min-width="160">
          <template #default="{ row }">
            <span class="color-pill" :style="{ background: row.color }"></span>
            <span class="color-text">{{ row.color }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑标签' : '新建标签'" width="520px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="96px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="form.color" show-alpha />
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
import { getTagList, createTag, updateTag, deleteTag } from '@/api/tag'
import type { Tag } from '@/types/trade'

const loading = ref(false)
const list = ref<Tag[]>([])

const dialogVisible = ref(false)
const formRef = ref()
const submitLoading = ref(false)
const editingId = ref<number | null>(null)

const form = ref<Pick<Tag, 'name' | 'color'>>({ name: '', color: '#409EFF' })

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getTagList()
    list.value = res.data?.items || []
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = { name: '', color: '#409EFF' }
  dialogVisible.value = true
}

const openEditDialog = (row: Tag) => {
  editingId.value = row.id
  form.value = { name: row.name, color: row.color }
  dialogVisible.value = true
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (editingId.value) {
      const res = await updateTag(editingId.value, { ...form.value })
      if (res.code === 200) ElMessage.success('更新成功')
    } else {
      const res = await createTag({ ...form.value })
      if (res.code === 200) ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await fetchList()
  } catch (e) {} finally {
    submitLoading.value = false
  }
}

const onDelete = async (row: Tag) => {
  try {
    await ElMessageBox.confirm(`确认删除标签 “${row.name}” 吗？`, '提示', { type: 'warning' })
    const res = await deleteTag(row.id)
    if (res.code === 200) {
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.color-pill {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #e5e7eb;
}
.color-text {
  color: #4b5563;
}
</style>