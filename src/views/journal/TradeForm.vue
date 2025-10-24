<template>
  <div class="page">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
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

        <el-tab-pane label="交易计划" name="plan">
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

        <el-tab-pane label="交易执行" name="execution">
          <el-form :model="form" label-width="160px" class="section-form">
            <el-form-item label="实际入场时间">
              <el-date-picker v-model="form.entry_time" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" />
            </el-form-item>
            <el-form-item label="实际入场价格">
              <el-input-number v-model="form.entry_price" :min="0" :precision="2" :step="0.5" :controls="false" />
            </el-form-item>
            <el-form-item label="实际离场时间">
              <el-date-picker v-model="form.exit_time" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss.SSSZ" />
            </el-form-item>
            <el-form-item label="实际离场价格">
              <el-input-number v-model="form.exit_price" :min="0" :precision="2" :step="0.5" :controls="false" />
            </el-form-item>
            <el-form-item label="手续费">
              <el-input-number v-model="form.fee" :min="0" :precision="2" :step="0.1" :controls="false" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="复盘总结" name="review">
          <el-form :model="form" label-width="160px" class="section-form">
            <el-form-item label="盈亏 (PnL)">
              <el-input-number v-model="form.pnl" :precision="2" :step="0.5" :controls="false" @change="pnlTouched = true" />
              <span class="hint">自动计算，亦可手动修改</span>
            </el-form-item>
            <el-form-item label="R 倍数">
              <el-input-number v-model="form.r_multiple" :precision="2" :step="0.1" :controls="false" />
            </el-form-item>
            <el-form-item label="退出原因">
              <el-input v-model="form.exit_reason" />
            </el-form-item>
            <el-form-item label="执行评分">
              <el-rate v-model="form.execution_score" />
            </el-form-item>
            <el-form-item label="复盘笔记">
              <el-input type="textarea" v-model="form.review_notes" :rows="3" />
            </el-form-item>
            <el-form-item label="标签">
              <el-select v-model="form.tag_ids" multiple filterable placeholder="选择标签" style="width: 300px">
                <el-option v-for="t in dataStore.tags" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部操作按钮 -->
      <div class="footer">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDataStore } from '@/store/data'
import { createTrade, updateTrade, getTradeDetail } from '@/api/trade'
import type { Trade, TradeSide } from '@/types/trade'

const router = useRouter()
const route = useRoute()
const dataStore = useDataStore()

const activeTab = ref('basic')
const saving = ref(false)
const pnlTouched = ref(false)

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
  router.push('/journal/list')
}

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

const onSave = async () => {
  try {
    saving.value = true
    if (isEdit()) {
      const id = Number(route.params.id)
      const res = await updateTrade(id, form.value)
      if (res.code === 200) ElMessage.success('更新成功')
    } else {
      const res = await createTrade(form.value)
      if (res.code === 200) ElMessage.success('创建成功')
    }
    router.push('/journal/list')
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