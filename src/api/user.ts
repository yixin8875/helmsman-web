import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { LoginResponseData } from '@/types/auth'

// 用户登录 API：POST /users/login
export const loginApi = (username: string, password: string) => {
  return request<LoginResponseData>({
    url: '/users/login',
    method: 'post',
    data: { username, password }
  })
}