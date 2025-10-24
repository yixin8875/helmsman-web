<template>
  <div class="page">
    <el-card class="summary" shadow="never">
      <div class="summary-top">
        <div class="symbol">
          <span class="text">{{ trade?.symbol || '-' }}</span>
          <el-tag :type="trade?.side === 'LONG' ? 'success' : 'danger'" disable-transitions>{{ sideLabel(trade?.side) }}</el-tag>
          <el-tag style="margin-left: 8px" :type="statusTagType(trade?.status)" disable-transitions>{{ trade?.status || '-' }}</el-tag>
        </div>
        <div class="metrics">
          <div>
            <div class="label">PnL</div>
            <div :class="pnlClass(trade?.pnl)">{{ formatNumber(trade?.pnl) }}</div>
          </div>
          <div>
            <div class="label">R 倍数</div>
            <div>{{ rMultipleText(trade?.r_multiple) }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-descriptions title="交易计划 (Plan)" :column="3" border>
        <el-descriptions-item label="账户">{{ accountName(trade?.account_id) }}</el-descriptions-item>
        <el-descriptions-item label="策略">{{ strategyName(trade?.strategy_id) }}</el-descriptions-item>
        <el-descriptions-item label="仓位大小">{{ formatNumber(trade?.position_size) }}</el-descriptions-item>
        <el-descriptions-item label="计划入场价">{{ formatNumber(trade?.planned_entry_price) }}</el-descriptions-item>
        <el-descriptions-item label="计划止损">{{ formatNumber(trade?.planned_stop_loss) }}</el-descriptions-item>
        <el-descriptions-item label="计划止盈">{{ formatNumber(trade?.planned_take_profit) }}</el-descriptions-item>
        <el-descriptions-item label="计划笔记" :span="3">{{ trade?.plan_notes || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <el-descriptions title="交易执行 (Execution)" :column="3" border>
        <el-descriptions-item label="实际入场时间">{{ formatDate(trade?.entry_time) }}</el-descriptions-item>
        <el-descriptions-item label="实际入场价格">{{ formatNumber(trade?.entry_price) }}</el-descriptions-item>
        <el-descriptions-item label="手续费">{{ formatNumber(trade?.fee) }}</el-descriptions-item>
        <el-descriptions-item label="实际离场时间">{{ formatDate(trade?.exit_time) }}</el-descriptions-item>
        <el-descriptions-item label="实际离场价格">{{ formatNumber(trade?.exit_price) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <el-descriptions title="复盘总结 (Review)" :column="3" border>
        <el-descriptions-item label="退出原因">{{ trade?.exit_reason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="执行评分">
          <el-rate v-model="executionScore" disabled />
        </el-descriptions-item>
        <el-descriptions-item label="标签">
          <el-space wrap>
            <el-tag v-for="tid in trade?.tag_ids || []" :key="tid" :style="{ backgroundColor: dataStore.tagMap.get(tid)?.color || '#e5e7eb', color: '#111827' }" disable-transitions>
              {{ dataStore.tagMap.get(tid)?.name || '标签' }}
            </el-tag>
          </el-space>
        </el-descriptions-item>
        <el-descriptions-item label="复盘笔记" :span="3">{{ trade?.review_notes || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <div class="snapshots">
        <div class="shot">
          <div class="title">预交易快照</div>
          <el-image v-if="preImageURL" :src="preImageURL" fit="contain" :preview-src-list="[preImageURL]" style="width: 100%; height: 280px" />
          <div v-else class="empty">暂无</div>
        </div>
        <div class="shot">
          <div class="title">后交易快照</div>
          <el-image v-if="postImageURL" :src="postImageURL" fit="contain" :preview-src-list="[postImageURL]" style="width: 100%; height: 280px" />
          <div v-else class="empty">暂无</div>
        </div>
      </div>
    </el-card>

    <div class="footer">
      <el-button @click="goBack">返回</el-button>
      <el-button type="primary" @click="handleEdit">编辑</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTradeDetail, getSnapshotsByTradeId } from '@/api/trade'
import type { Trade } from '@/types/trade'
import { useDataStore } from '@/store/data'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()

const trade = ref<Trade | undefined>(undefined)
const executionScore = ref<number>(0)
const preImageURL = ref<string>('')
const postImageURL = ref<string>('')

const goBack = () => router.push('/journal')
const handleEdit = () => router.push(`/journal/edit/${trade.value?.id}`)

const sideLabel = (side?: string) => {
  if (!side) return '-'
  return side === 'LONG' ? '多' : side === 'SHORT' ? '空' : side
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

const accountName = (id?: number) => (id ? dataStore.accountMap.get(id)?.name || '-' : '-')
const strategyName = (id?: number) => (id ? dataStore.strategyMap.get(id)?.name || '-' : '-')
const rMultipleText = (r?: number) => (r == null ? '-' : `${Number(r).toFixed(2)} R`)

onMounted(async () => {
  await dataStore.ensureLoaded()
  const id = Number(route.params.id)
  const res = await getTradeDetail(id)
  trade.value = res.data
  executionScore.value = trade.value?.execution_score || 0

  const snaps = await getSnapshotsByTradeId(id)
  const items = snaps.data?.items || []
  const pre = items.find((x) => (x.type || '').toLowerCase() === 'pre')
  const post = items.find((x) => (x.type || '').toLowerCase() === 'post')
  preImageURL.value = pre?.imageURL || ''
  postImageURL.value = post?.imageURL || ''
})
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.symbol {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}
.metrics {
  display: flex;
  gap: 24px;
}
.metrics .label {
  font-size: 12px;
  color: #6b7280;
}
.snapshots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.shot .title {
  font-weight: 600;
  margin-bottom: 6px;
}
.empty {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  border: 1px dashed #e5e7eb;
}
.pnl-pos { color: #16a34a; }
.pnl-neg { color: #dc2626; }
.pnl-neutral { color: #6b7280; }
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>