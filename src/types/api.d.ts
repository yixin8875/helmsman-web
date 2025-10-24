// 统一的后端响应格式定义
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}