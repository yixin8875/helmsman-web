import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import Login from '@/views/login/Login.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import { useUserStore } from '@/store/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'MainLayout',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard', // 子路由使用相对路径
        name: 'Dashboard',
        component: Dashboard
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫：基于 token 检查登录态
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.token

  if (!isLoggedIn && to.path !== '/login') {
    next('/login')
    return
  }
  if (isLoggedIn && to.path === '/login') {
    next('/dashboard')
    return
  }
  next()
})

export default router