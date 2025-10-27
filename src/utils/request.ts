import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'
import router from '@/router'

// 从环境变量读取基础 URL
const baseURL = import.meta.env.VITE_APP_API_BASE_URL as string

// 统一的 Token 存储键名
const TOKEN_KEY = 'HELMSMAN_TOKEN'

// 创建 Axios 实例
const service = axios.create({
  baseURL,
  timeout: 15000
})

// 请求拦截器：注入 Authorization 头
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一错误处理与 401 重定向
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data
    // 兼容某些服务返回外层包装（含 body 字符串）的 401 未授权
    let innerCode: number | undefined
    const body = (res as any)?.body
    if (typeof body === 'string') {
      try {
        const inner = JSON.parse(body)
        innerCode = inner?.code
      } catch {}
    }
    if (res.code === 401 || innerCode === 401) {
      // 未授权：清除 token 并跳转登录
      localStorage.removeItem(TOKEN_KEY)
      router.replace('/login')
      return Promise.reject(new Error((res as any).msg || '未授权'))
    }
    // 返回原始响应，后续由封装函数提取 data
    return response
  },
  (error) => {
    // HTTP 层错误，例如网络问题或 401
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      router.replace('/login')
    }
    return Promise.reject(error)
  }
)

// 泛型封装：返回统一的 ApiResponse<T>
export default function request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return service.request<ApiResponse<T>>(config).then((resp) => resp.data as ApiResponse<T>)
}