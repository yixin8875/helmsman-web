import { defineStore } from 'pinia'
import { loginApi } from '@/api/user'
import router from '@/router'

// 统一的登录 token 存储键名
const TOKEN_KEY = 'HELMSMAN_TOKEN'

// 用户信息类型（可根据后端返回逐步完善）
export interface UserInfo {
  id?: string | number
  username?: string
  avatar?: string
  [key: string]: unknown
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: (localStorage.getItem(TOKEN_KEY) || null) as string | null,
    userInfo: {} as UserInfo
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login(form: LoginForm) {
      // 调用用户登录 API
      const res = await loginApi(form.username, form.password)
      // 约定返回结构：{ code, msg, data: { token, userInfo } }
      const token = res.data?.token
      if (token) {
        this.token = token
        localStorage.setItem(TOKEN_KEY, token)
        this.userInfo = res.data?.userInfo || {}
        // 跳转到仪表盘
        await router.replace('/dashboard')
      } else {
        throw new Error(res.msg || '登录失败')
      }
    },
    async logout() {
      this.token = null
      this.userInfo = {}
      localStorage.removeItem(TOKEN_KEY)
      await router.replace('/login')
    }
  }
})