<template>
  <div class="page">
    <!-- 顶部筛选区 -->
    <el-card shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item label="账户">
          <el-select v-model="filters.account_id" placeholder="请选择账户" clearable style="width: 180px">
            <el-option v-for="acc in dataStore.accounts" :key="acc.id" :label="acc.name" :value="acc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="策略">
          <el-select v-model="filters.strategy_id" placeholder="请选择策略" clearable style="width: 180px">
            <el-option v-for="s in dataStore.strategies" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易品种">
          <el-input v-model="filters.symbol" placeholder="例如：BTCUSDT" style="width: 180px" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filters.tag_ids" multiple placeholder="选择标签" clearable style="width: 240px">
            <el-option v-for="t in dataStore.tags" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onQuery">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
        <el-form-item class="flex-grow"></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleCreate">记录新交易</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" disable-transitions>{{ row.status || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="品种 / 方向" min-width="180">
          <template #default="{ row }">
            {{ row.symbol }}
            <el-tag size="small" :type="row.side === 'LONG' ? 'success' : 'danger'" style="margin-left: 6px" disable-transitions>
              {{ sideLabel(row.side) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开仓时间" min-width="180">
          <template #default="{ row }">{{ formatDate(row.entry_time) }}</template>
        </el-table-column>
        <el-table-column label="盈亏 (PnL)" min-width="140">
          <template #default="{ row }">
            <span :class="pnlClass(row.pnl)">{{ formatNumber(row.pnl) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险回报" min-width="120">
          <template #default="{ row }">{{ rMultipleText(row.r_multiple) }}</template>
        </el-table-column>
        <el-table-column label="策略" min-width="160">
          <template #default="{ row }">{{ dataStore.strategyMap.get(row.strategy_id || 0)?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="tid in row.tag_ids || []" :key="tid" :style="{ backgroundColor: dataStore.tagMap.get(tid)?.color || '#e5e7eb', color: '#111827' }" disable-transitions>
                {{ dataStore.tagMap.get(tid)?.name || '标签' }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleView(row)">详情</el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next, sizes, jumper, total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTradeList, deleteTrade, getTradeTagsByTradeIds } from '@/api/trade'
import type { ListParams } from '@/types/api'
import type { Trade } from '@/types/trade'
import { useDataStore } from '@/store/data'

const router = useRouter()
const dataStore = useDataStore()

const loading = ref(false)
const list = ref<Trade[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const filters = ref<{ dateRange?: [Date, Date] | null; account_id?: number | null; strategy_id?: number | null; symbol?: string | null; tag_ids?: number[] }>({
  dateRange: null,
  account_id: null,
  strategy_id: null,
  symbol: null,
  tag_ids: []
})

const buildListParams = (): ListParams => {
  const columns: any[] = []
  if (filters.value.account_id) columns.push({ name: 'accountID', exp: '=', value: filters.value.account_id })
  if (filters.value.strategy_id) columns.push({ name: 'strategyID', exp: '=', value: filters.value.strategy_id })
  if (filters.value.symbol) columns.push({ name: 'symbol', exp: 'like', value: `%${filters.value.symbol}%` })
  if (filters.value.dateRange && filters.value.dateRange.length === 2) {
    columns.push({ name: 'actualEntryTime', exp: '>=', value: filters.value.dateRange[0].toISOString() })
    columns.push({ name: 'actualEntryTime', exp: '<=', value: filters.value.dateRange[1].toISOString() })
  }
  return { page: page.value - 1, limit: pageSize.value, columns }
}

const loadList = async () => {
  loading.value = true
  try {
    const params = buildListParams()
    const res = await getTradeList(params)
    const items = res.data?.items || []
    total.value = res.data?.total || items.length
    list.value = items

    // 补充标签：按 tradeIDs 批量查询并回填 tag_ids
    if (items.length) {
      const ids = items.map((i) => i.id!)
      const tagRes = await getTradeTagsByTradeIds(ids)
      const map = new Map<number, number[]>()
      ;(tagRes.data?.items || []).forEach((x) => {
        const arr = map.get(x.tradeID) || []
        arr.push(x.tagID)
        map.set(x.tradeID, arr)
      })
      list.value = items.map((i) => ({ ...i, tag_ids: map.get(i.id!) || [] }))
    }

    // 标签筛选（前端 OR 过滤）
    if (filters.value.tag_ids && filters.value.tag_ids.length) {
      const need = new Set(filters.value.tag_ids)
      list.value = list.value.filter((row) => (row.tag_ids || []).some((tid) => need.has(tid)))
      total.value = list.value.length
    }
  } finally {
    loading.value = false
  }
}

const onQuery = async () => {
  page.value = 1
  await loadList()
}

const onReset = async () => {
  filters.value = { dateRange: null, account_id: null, strategy_id: null, symbol: null, tag_ids: [] }
  page.value = 1
  await loadList()
}

const handleCreate = () => {
  router.push('/journal/new')
}

const handleView = (row: Trade) => {
  if (!row.id) return
  router.push(`/journal/view/${row.id}`)
}

const handleEdit = (row: Trade) => {
  if (!row.id) return
  router.push(`/journal/edit/${row.id}`)
}

const handleDelete = async (row: Trade) => {
  if (!row.id) return
  try {
    await ElMessageBox.confirm('确认删除该交易记录吗？', '提示', { type: 'warning' })
    const res = await deleteTrade(row.id)
    if (res.code === 200 || res.code === 0) {
      ElMessage.success('删除成功')
      await loadList()
    }
  } catch (e) {}
}

const handleSizeChange = async (val: number) => {
  pageSize.value = val
  page.value = 1
  await loadList()
}

const handleCurrentChange = async (val: number) => {
  page.value = val
  await loadList()
}

const pnlClass = (pnl?: number) => {
  if (pnl == null) return 'pnl-neutral'
  return pnl >= 0 ? 'pnl-pos' : 'pnl-neg'
}

const formatNumber = (n?: number) => {
  if (n == null) return '-'
  return Number(n).toFixed(2)
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

const sideLabel = (side?: string) => {
  if (!side) return '-'
  return side === 'LONG' ? '多' : side === 'SHORT' ? '空' : side
}

const rMultipleText = (r?: number) => {
  if (r == null) return '-'
  return `${Number(r).toFixed(2)} R`
}

const statusTagType = (s?: string) => {
  switch ((s || '').toLowerCase()) {
    case 'planned':
      return 'info'
    case 'active':
      return 'warning'
    case 'closed':
      return 'success'
    default:
      return ''
  }
}

onMounted(async () => {
  await dataStore.ensureLoaded()
  await loadList()
})
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.filter-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.flex-grow {
  flex: 1;
}
.pnl-pos {
  color: #16a34a; /* green-600 */
}
.pnl-neg {
  color: #dc2626; /* red-600 */
}
.pnl-neutral {
  color: #6b7280; /* gray-500 */
}
.pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}
</style>