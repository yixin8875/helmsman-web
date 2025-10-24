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

// 注册请求与响应类型
export interface RegisterForm {
  username: string
  password: string
  email?: string
}

export interface RegisterResponseData {
  userInfo?: UserInfo
  message?: string
}