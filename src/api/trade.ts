import request from '@/utils/request'
import type { ApiResponse, ListParams } from '@/types/api'
import type { Trade, Paginated } from '@/types/trade'

// 将后端 TradesObjDetail 映射到前端 Trade 类型（camelCase -> snake_case）
function mapTradeFromApi(t: any): Trade {
  return {
    id: t.id,
    account_id: t.accountID,
    strategy_id: t.strategyID,
    symbol: t.symbol,
    side: t.direction, // 后端字段为 direction
    status: t.status,
    planned_entry_price: t.plannedEntryPrice,
    planned_stop_loss: t.plannedStopLoss,
    planned_take_profit: t.plannedTakeProfit,
    position_size: t.positionSize,
    plan_notes: t.planNotes,
    entry_time: t.actualEntryTime,
    entry_price: t.actualEntryPrice,
    exit_time: t.actualExitTime,
    exit_price: t.actualExitPrice,
    fee: t.commission,
    pnl: t.pnl,
    r_multiple: t.rMultiple,
    exit_reason: t.exitReason,
    execution_score: t.executionScore,
    review_notes: t.reflectionNotes,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
    tag_ids: t.tagIDs || []
  }
}

// 将前端 Trade 类型映射到后端请求体（snake_case -> camelCase）
function mapTradeToCreatePayload(data: Partial<Trade>): any {
  return {
    accountID: data.account_id,
    strategyID: data.strategy_id,
    symbol: data.symbol,
    direction: data.side,
    status: data.status,
    plannedEntryPrice: data.planned_entry_price,
    plannedStopLoss: data.planned_stop_loss,
    plannedTakeProfit: data.planned_take_profit,
    positionSize: data.position_size,
    planNotes: data.plan_notes,
    actualEntryTime: data.entry_time,
    actualEntryPrice: data.entry_price,
    actualExitTime: data.exit_time,
    actualExitPrice: data.exit_price,
    commission: data.fee,
    pnl: data.pnl,
    rMultiple: data.r_multiple,
    exitReason: data.exit_reason,
    executionScore: data.execution_score,
    reflectionNotes: data.review_notes
  }
}

function mapTradeToUpdatePayload(id: number | string, data: Partial<Trade>): any {
  return {
    id: typeof id === 'string' ? Number(id) : id,
    ...mapTradeToCreatePayload(data)
  }
}

// 列表：POST /trades/list（ListParams）
export const getTradeList = (params?: ListParams): Promise<ApiResponse<Paginated<Trade>>> => {
  const payload: ListParams = params ?? { page: 0, limit: 10 }
  return request<{ tradess: any[]; total?: number }>({
    url: '/trades/list',
    method: 'post',
    data: payload
  }).then((res) => {
    const items: Trade[] = (res.data?.tradess || []).map(mapTradeFromApi)
    return { code: res.code, msg: res.msg, data: { items, total: res.data?.total ?? items.length } }
  })
}

// 详情：GET /trades/{id}
export const getTradeDetail = (id: number | string): Promise<ApiResponse<Trade>> => {
  return request<{ trades: any }>({ url: `/trades/${id}`, method: 'get' }).then((res) => {
    const t = res.data?.trades
    return { code: res.code, msg: res.msg, data: t ? mapTradeFromApi(t) : (undefined as any) }
  })
}

// 创建：POST /trades
export const createTrade = (data: Partial<Trade>): Promise<ApiResponse<{ id: number }>> => {
  const payload = mapTradeToCreatePayload(data)
  return request<{ id: number }>({ url: '/trades', method: 'post', data: payload })
}

// 更新：PUT /trades/{id}
export const updateTrade = (id: number | string, data: Partial<Trade>): Promise<ApiResponse<any>> => {
  const payload = mapTradeToUpdatePayload(id, data)
  return request<any>({ url: `/trades/${id}`, method: 'put', data: payload })
}

// 删除：DELETE /trades/{id}
export const deleteTrade = (id: number | string): Promise<ApiResponse<null>> => {
  return request<null>({ url: `/trades/${id}`, method: 'delete' })
}

// 批量查询 tradeTags：POST /tradeTags/all（通过前端过滤 tradeIDs）
export const getTradeTagsByTradeIds = (tradeIds: Array<number | string>): Promise<ApiResponse<{ items: { tradeID: number; tagID: number }[] }>> => {
  const idSet = new Set(tradeIds.map((v) => Number(v)))
  return request<{ tradeTags: { tradeID: number; tagID: number }[] }>({
    url: '/tradeTags/all',
    method: 'post',
    data: {}
  }).then((res) => {
    const items = (res.data?.tradeTags || [])
      .filter((x) => idSet.has(Number(x.tradeID)))
      .map((x) => ({ tradeID: x.tradeID, tagID: x.tagID }))
    return { code: res.code, msg: res.msg, data: { items } }
  })
}

// 创建 tradeTag 关系：POST /tradeTags
export const createTradeTag = (tradeID: number, tagID: number): Promise<ApiResponse<{ id: number }>> => {
  return request<{ id: number }>({ url: '/tradeTags', method: 'post', data: { tradeID, tagID } })
}

// 快照：列表与创建
export const getSnapshotsByTradeId = (tradeID: number | string): Promise<ApiResponse<{ items: { id: number; imageURL: string; type: string }[] }>> => {
  const columns = [{ name: 'tradeID', exp: '=', value: tradeID }]
  return request<{ snapshotss: { id: number; imageURL: string; type: string }[] }>({ url: '/snapshots/list', method: 'post', data: { page: 0, limit: 50, columns } }).then((res) => {
    const items = (res.data?.snapshotss || []).map((s) => ({ id: s.id, imageURL: s.imageURL, type: s.type }))
    return { code: res.code, msg: res.msg, data: { items } }
  })
}

export const createSnapshot = (tradeID: number, imageURL: string, type: string): Promise<ApiResponse<{ id: number }>> => {
  // 后端对 /snapshots 进行 307 重定向到 /snapshots/，直接使用带尾斜杠的路径以避免重定向导致的代理 EPIPE
  return request<{ id: number }>({ url: '/snapshots/', method: 'post', data: { tradeID, imageURL, type } })
}

export const getAllTradeTags = (): Promise<ApiResponse<{ items: { tradeID: number; tagID: number; createdAt?: string; updatedAt?: string }[] }>> => {
  return request<{ tradeTags: { tradeID: number; tagID: number; createdAt?: string; updatedAt?: string }[] }>({
    url: '/tradeTags/all',
    method: 'post',
    data: {}
  }).then((res) => {
    const items = (res.data?.tradeTags || []).map((x) => ({
      tradeID: x.tradeID,
      tagID: x.tagID,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt
    }))
    return { code: res.code, msg: res.msg, data: { items } }
  })
}