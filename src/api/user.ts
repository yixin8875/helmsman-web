import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { LoginResponseData, RegisterResponseData } from '@/types/auth'

// 用户登录 API：POST /users/login
export const loginApi = (username: string, password: string) => {
  return request<LoginResponseData>({
    url: '/users/login',
    method: 'post',
    data: { username, password }
  })
}

// 用户注册 API：POST /users/register
export const registerApi = (username: string, password: string, email?: string) => {
  return request<RegisterResponseData>({
    url: '/users/register',
    method: 'post',
    data: { username, password, email }
  })
}