// 用户相关的类型定义
export interface UserInfo {
  id?: string | number
  username?: string
  avatar?: string
  [key: string]: unknown
}

export interface LoginResponseData {
  token: string
  userInfo?: UserInfo
}