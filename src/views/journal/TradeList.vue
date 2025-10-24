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
        <el-form-item>
          <el-button type="primary" @click="onQuery">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
        <el-form-item class="flex-grow"></el-form-item>
        <el-form-item>
          <el-button type="success" round @click="goCreate">+ 记录新交易</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="symbol" label="品种" min-width="160" />
        <el-table-column label="方向" width="100">
          <template #default="{ row }">
            <el-tag :type="row.side === 'LONG' ? 'success' : 'danger'" disable-transitions>{{ row.side }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开仓日期" min-width="180">
          <template #default="{ row }">{{ formatDate(row.entry_time) }}</template>
        </el-table-column>
        <el-table-column label="盈亏 (PnL)" min-width="140">
          <template #default="{ row }">
            <span :class="pnlClass(row.pnl)">{{ formatNumber(row.pnl) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="r_multiple" label="R 倍数" min-width="120" />
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="goDetail(row)">查看详情</el-button>
            <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTradeList, deleteTrade, type TradeListParams } from '@/api/trade'
import type { Trade } from '@/types/trade'
import { useDataStore } from '@/store/data'

const router = useRouter()
const dataStore = useDataStore()

const loading = ref(false)
const list = ref<Trade[]>([])

const filters = ref<{ dateRange?: [Date, Date] | null; account_id?: number | null; strategy_id?: number | null; symbol?: string | null }>({
  dateRange: null,
  account_id: null,
  strategy_id: null,
  symbol: null
})

const onQuery = async () => {
  loading.value = true
  try {
    const params: TradeListParams = {}
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      params.start_date = filters.value.dateRange[0].toISOString()
      params.end_date = filters.value.dateRange[1].toISOString()
    }
    if (filters.value.account_id) params.account_id = filters.value.account_id
    if (filters.value.strategy_id) params.strategy_id = filters.value.strategy_id
    if (filters.value.symbol) params.symbol = filters.value.symbol

    const res = await getTradeList(params)
    list.value = res.data?.items || []
  } finally {
    loading.value = false
  }
}

const onReset = () => {
  filters.value = { dateRange: null, account_id: null, strategy_id: null, symbol: null }
  onQuery()
}

const goCreate = () => {
  router.push('/journal/new')
}

const goDetail = (row: Trade) => {
  if (!row.id) return
  router.push(`/journal/edit/${row.id}`)
}

const onDelete = async (row: Trade) => {
  if (!row.id) return
  try {
    await ElMessageBox.confirm('确认删除该交易记录吗？', '提示', { type: 'warning' })
    const res = await deleteTrade(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await onQuery()
    }
  } catch (e) {}
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

onMounted(async () => {
  await dataStore.ensureLoaded()
  await onQuery()
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
</style>