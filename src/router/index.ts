import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import Login from '@/views/login/Login.vue'
import Register from '@/views/login/Register.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import { useUserStore } from '@/store/user'
import Accounts from '@/views/management/Accounts.vue'
import Strategies from '@/views/management/Strategies.vue'
import Tags from '@/views/management/Tags.vue'
import TradeList from '@/views/journal/TradeList.vue'
import TradeForm from '@/views/journal/TradeForm.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
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
      },
      {
        path: 'management/accounts',
        name: 'ManagementAccounts',
        component: Accounts
      },
      {
        path: 'management/strategies',
        name: 'ManagementStrategies',
        component: Strategies
      },
      {
        path: 'management/tags',
        name: 'ManagementTags',
        component: Tags
      },
      {
        path: 'journal',
        name: 'JournalList',
        component: TradeList
      },
      {
        path: 'journal/new',
        name: 'JournalNew',
        component: TradeForm
      },
      {
        path: 'journal/edit/:id',
        name: 'JournalEdit',
        component: TradeForm
      },
      {
        path: 'journal/view/:id',
        name: 'JournalView',
        component: () => import('@/views/journal/TradeDetail.vue')
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

  if (!isLoggedIn && to.path !== '/login' && to.path !== '/register') {
    next('/login')
    return
  }
  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard')
    return
  }
  next()
})

export default router