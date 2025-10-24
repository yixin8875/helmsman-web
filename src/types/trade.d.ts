// 交易相关类型定义，遵循后端数据结构并保持一致

// 通用分页响应数据
export interface Paginated<T> {
  items: T[]
  total: number
}

// 账户
export interface Account {
  id: number
  name: string
  initial_balance: number
  currency: string
  created_at?: string
  updated_at?: string
}

// 策略
export interface Strategy {
  id: number
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

// 标签
export interface Tag {
  id: number
  name: string
  color: string // HEX 或 RGB 字符串
  created_at?: string
  updated_at?: string
}

// 交易方向
export type TradeSide = 'LONG' | 'SHORT'

// 交易状态
export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED'

// 交易记录
export interface Trade {
  id?: number
  // 归属
  account_id: number
  strategy_id?: number
  symbol: string
  side: TradeSide
  status?: TradeStatus

  // 交易计划
  planned_entry_price?: number
  planned_stop_loss?: number
  planned_take_profit?: number
  position_size?: number
  plan_notes?: string

  // 交易执行
  entry_time?: string // ISO 字符串
  entry_price?: number
  exit_time?: string // ISO 字符串
  exit_price?: number
  fee?: number

  // 复盘总结
  pnl?: number
  r_multiple?: number
  exit_reason?: string
  execution_score?: number // 0-5，配合 ElRate
  review_notes?: string
  tag_ids?: number[]
  tags?: Tag[]

  // 元信息
  created_at?: string
  updated_at?: string
}

// 列表/详情响应类型
export interface TradeListData extends Paginated<Trade> {}
export interface TradeDetailData extends Trade {}