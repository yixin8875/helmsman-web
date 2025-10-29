<template>
  <div class="page">
    <el-card shadow="never">
      <el-steps :active="activeStep" finish-status="success" class="steps">
        <el-step title="基本信息" />
        <el-step title="交易计划" />
        <el-step title="交易执行" />
        <el-step title="复盘总结" />
      </el-steps>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic" :disabled="stepsDisabled.basic">
          <el-form :model="form" label-width="120px" class="section-form">
            <el-form-item label="账户" required>
              <el-select v-model="form.account_id" placeholder="请选择账户" style="width: 260px">
                <el-option v-for="acc in dataStore.accounts" :key="acc.id" :label="acc.name" :value="acc.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="策略">
              <el-select v-model="form.strategy_id" placeholder="请选择策略" clearable style="width: 260px">
                <el-option v-for="s in dataStore.strategies" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="交易品种" required>
              <el-input v-model="form.symbol" placeholder="例如：BTCUSDT" style="width: 260px" />
            </el-form-item>
            <el-form-item label="方向" required>
              <el-radio-group v-model="form.side">
                <el-radio-button label="LONG" />
                <el-radio-button label="SHORT" />
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="交易计划" name="plan" :disabled="stepsDisabled.plan">
          <el-form :model="form" label-width="160px" class="section-form">
            <el-form-item label="计划入场价">
              <el-input-number v-model="form.planned_entry_price" :min="0" :precision="2" :step="0.5" :controls="false" />
            </el-form-item>
            <el-form-item label="计划止损">
              <el-input-number v-model="form.planned_stop_loss" :min="0" :precision="2" :step="0.5" :controls="false" />
            </el-form-item>
            <el-form-item label="计划止盈">
              <el-input-number v-model="form.planned_take_profit" :min="0" :precision="2" :step="0.5" :controls="false" />
            </el-form-item>
            <el-form-item label="仓位大小">
              <el-input-number v-model="form.position_size" :min="0" :precision="4" :step="1" :controls="false" />
            </el-form-item>
            <el-form-item label="计划笔记">
              <el-input type="textarea" v-model="form.plan_notes" :rows="3" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="交易执行" name="execution" :disabled="stepsDisabled.execution">
          <el-form :model="form" label-width="160px" class="section-form">
            <el-form-item label="实际入场时间">
              <el-date-picker v-model="form.entry_time" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" :disabled="!canEditEntry" />
            </el-form-item>
            <el-form-item label="实际入场价格">
              <el-input-number v-model="form.entry_price" :min="0" :precision="2" :step="0.5" :controls="false" :disabled="!canEditEntry" />
            </el-form-item>
            <el-form-item label="实际离场时间">
              <el-date-picker v-model="form.exit_time" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" :disabled="!canEditExit" />
            </el-form-item>
            <el-form-item label="实际离场价格">
              <el-input-number v-model="form.exit_price" :min="0" :precision="2" :step="0.5" :controls="false" :disabled="!canEditExit" />
            </el-form-item>
            <el-form-item label="手续费">
              <el-input-number v-model="form.fee" :min="0" :precision="2" :step="0.1" :controls="false" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="复盘总结" name="review" :disabled="stepsDisabled.review">
          <el-form :model="form" label-width="160px" class="section-form">
            <el-form-item label="盈亏 (PnL)">
              <el-input-number v-model="form.pnl" :precision="2" :step="0.5" :controls="false" @change="pnlTouched = true" :disabled="!reviewEnabled" />
              <span class="hint">自动计算，亦可手动修改</span>
            </el-form-item>
            <el-form-item label="R 倍数">
              <el-input-number v-model="form.r_multiple" :precision="2" :step="0.1" :controls="false" :disabled="!reviewEnabled" />
            </el-form-item>
            <el-form-item label="退出原因">
              <el-input v-model="form.exit_reason" :disabled="!reviewEnabled" />
            </el-form-item>
            <el-form-item label="执行评分">
              <el-rate v-model="form.execution_score" :disabled="!reviewEnabled" />
            </el-form-item>
            <el-form-item label="复盘笔记">
              <el-input type="textarea" v-model="form.review_notes" :rows="3" :disabled="!reviewEnabled" />
            </el-form-item>
            <el-form-item label="标签">
              <el-select v-model="form.tag_ids" multiple filterable placeholder="选择标签" style="width: 300px" :disabled="!reviewEnabled">
                <el-option v-for="t in dataStore.tags" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="预交易快照">
              <el-upload :file-list="preFiles" :auto-upload="false" :limit="1" accept="image/*" :on-change="onPreFileChange" :before-upload="() => false" list-type="picture-card" :disabled="!reviewEnabled">
                <el-icon><i class="el-icon-plus"></i></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="后交易快照">
              <el-upload :file-list="postFiles" :auto-upload="false" :limit="1" accept="image/*" :on-change="onPostFileChange" :before-upload="() => false" list-type="picture-card" :disabled="!reviewEnabled">
                <el-icon><i class="el-icon-plus"></i></el-icon>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部操作按钮 -->
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <template v-if="actionButtons.length">
          <el-button
            v-for="btn in actionButtons"
            :key="btn.key"
            :type="btn.type || 'primary'"
            :loading="saving"
            @click="onAction(btn.key)"
          >{{ btn.label }}</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDataStore } from '@/store/data'
import { createTrade, updateTrade, getTradeDetail, createSnapshot, createTradeTag, getTradeTagsByTradeIds } from '@/api/trade'
import type { Trade, TradeSide } from '@/types/trade'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const activeTab = ref('basic')
const saving = ref(false)
const pnlTouched = ref(false)

const preFiles = ref<any[]>([])
const postFiles = ref<any[]>([])
const preImage = ref<string>('')
const postImage = ref<string>('')

const form = ref<Trade>({
  account_id: 0,
  strategy_id: undefined,
  symbol: '',
  side: 'LONG',
  planned_entry_price: undefined,
  planned_stop_loss: undefined,
  planned_take_profit: undefined,
  position_size: undefined,
  plan_notes: '',
  entry_time: undefined,
  entry_price: undefined,
  exit_time: undefined,
  exit_price: undefined,
  fee: 0,
  pnl: undefined,
  r_multiple: undefined,
  exit_reason: '',
  execution_score: 0,
  review_notes: '',
  tag_ids: []
})

const isEdit = () => !!route.params.id

const onCancel = () => {
  router.push('/journal')
}

// 状态驱动的步骤条与禁用逻辑
type TradeStatusExt = 'new' | 'planned' | 'active' | 'closed'
const currentStatus = computed<TradeStatusExt>(() => {
  if (!isEdit()) return 'new'
  const s = (form.value.status as any) || 'planned'
  return s as TradeStatusExt
})

const activeStep = computed(() => {
  switch (currentStatus.value) {
    case 'new': return 0
    case 'planned': return 1
    case 'active': return 2
    case 'closed': return 3
    default: return 0
  }
})

const stepsDisabled = computed(() => {
  const st = currentStatus.value
  return {
    basic: false,
    plan: false,
    execution: st === 'new',
    review: st === 'new' || st === 'planned'
  }
})

const canEditEntry = computed(() => {
  const st = currentStatus.value
  return st === 'planned' || st === 'closed'
})

const canEditExit = computed(() => {
  const st = currentStatus.value
  return st === 'active' || st === 'closed'
})

const reviewEnabled = computed(() => {
  const st = currentStatus.value
  return st === 'active' || st === 'closed'
})

// 底部按钮
const actionButtons = computed(() => {
  const st = currentStatus.value
  if (st === 'new') {
    return [{ key: 'create_planned', label: '保存计划', type: 'primary' }]
  }
  if (st === 'planned') {
    return [
      { key: 'update_planned', label: '更新计划', type: 'primary' },
      { key: 'activate_open', label: '执行开仓', type: 'success' }
    ]
  }
  if (st === 'active') {
    return [{ key: 'close_and_save', label: '平仓并保存', type: 'danger' }]
  }
  if (st === 'closed') {
    return [{ key: 'update_record', label: '更新记录', type: 'primary' }]
  }
  return []
})

watch(currentStatus, (st) => {
  const map: Record<TradeStatusExt, string> = { new: 'basic', planned: 'plan', active: 'execution', closed: 'review' }
  activeTab.value = map[st]
})

const computePnl = () => {
  const entry = form.value.entry_price
  const exit = form.value.exit_price
  const size = form.value.position_size
  const fee = form.value.fee || 0
  const side: TradeSide = form.value.side
  if (entry == null || exit == null || size == null) return
  const diff = (exit - entry) * (side === 'LONG' ? 1 : -1)
  const pnl = diff * size - fee
  if (!pnlTouched.value) form.value.pnl = Number(pnl.toFixed(2))
  // 计算 R
  const stop = form.value.planned_stop_loss
  if (stop != null && form.value.planned_entry_price != null && size != null) {
    const risk = Math.abs(form.value.planned_entry_price - stop) * size
    if (risk > 0) form.value.r_multiple = Number((pnl / risk).toFixed(2))
  }
}

watch(() => [form.value.entry_price, form.value.exit_price, form.value.position_size, form.value.fee, form.value.side, form.value.planned_stop_loss, form.value.planned_entry_price], computePnl)

const loadDetailIfNeeded = async () => {
  if (!isEdit()) return
  const id = Number(route.params.id)
  const res = await getTradeDetail(id)
  const d = res.data
  if (d) {
    form.value = {
      ...form.value,
      ...d,
      tag_ids: d.tag_ids || [],
      execution_score: d.execution_score || 0
    }
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const onPreFileChange = async (file: any) => {
  if (file && file.raw) {
    preImage.value = await fileToBase64(file.raw as File)
    preFiles.value = [file]
  }
}

const onPostFileChange = async (file: any) => {
  if (file && file.raw) {
    postImage.value = await fileToBase64(file.raw as File)
    postFiles.value = [file]
  }
}

async function syncTags(id: number) {
  if (form.value.tag_ids && form.value.tag_ids.length) {
    const existing = await getTradeTagsByTradeIds([id])
    const existingIds = new Set((existing.data?.items || []).map((x) => x.tagID))
    for (const tid of form.value.tag_ids) {
      if (!existingIds.has(tid)) {
        await createTradeTag(id, tid)
      }
    }
  }
}

const onAction = async (key: string) => {
  try {
    saving.value = true
    if (key === 'create_planned') {
      const payload = { ...form.value, status: 'planned' as any }
      const res = await createTrade(payload)
      if (res.code === 200 || res.code === 0) {
        ElMessage.success('计划已保存')
        router.push('/journal')
      }
    } else if (key === 'update_planned') {
      const id = Number(route.params.id)
      const payload = { ...form.value, status: 'planned' as any }
      const res = await updateTrade(id, payload)
      if (res.code === 200 || res.code === 0) {
        ElMessage.success('计划已更新')
      }
    } else if (key === 'activate_open') {
      if (!form.value.entry_time || form.value.entry_price == null) {
        ElMessage.error('请填写入场时间与入场价格')
        return
      }
      const id = Number(route.params.id)
      const payload = { ...form.value, status: 'active' as any }
      const res = await updateTrade(id, payload)
      if (res.code === 200 || res.code === 0) {
        if (preImage.value) await createSnapshot(id, preImage.value, 'pre')
        await syncTags(id)
        ElMessage.success('已执行开仓')
      }
    } else if (key === 'close_and_save') {
      if (!form.value.exit_time || form.value.exit_price == null) {
        ElMessage.error('请填写离场时间与离场价格')
        return
      }
      const id = Number(route.params.id)
      const payload = { ...form.value, status: 'closed' as any }
      const res = await updateTrade(id, payload)
      if (res.code === 200 || res.code === 0) {
        if (postImage.value) await createSnapshot(id, postImage.value, 'post')
        await syncTags(id)
        ElMessage.success('已平仓并保存')
      }
    } else if (key === 'update_record') {
      const id = Number(route.params.id)
      const payload = { ...form.value, status: 'closed' as any }
      const res = await updateTrade(id, payload)
      if (res.code === 200 || res.code === 0) {
        if (preImage.value) await createSnapshot(id, preImage.value, 'pre')
        if (postImage.value) await createSnapshot(id, postImage.value, 'post')
        await syncTags(id)
        ElMessage.success('记录已更新')
      }
    }
  } catch (e) {} finally {
    saving.value = false
  }
}

onMounted(async () => {
  await dataStore.ensureLoaded()
  await loadDetailIfNeeded()
})
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-form {
  max-width: 760px;
}
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.hint {
  margin-left: 12px;
  color: #6b7280;
}
</style>