// 统一的后端响应格式定义
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface QueryColumn {
  name: string
  exp?: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'like' | 'in' | 'notin' | 'isnull' | 'isnotnull' | string
  value?: unknown
  logic?: 'and' | 'or' | string
}

export interface ListParams {
  page?: number
  limit?: number
  sort?: string
  columns?: QueryColumn[]
  // Deprecated: sponge v1.8.6 兼容字段
  size?: number
}