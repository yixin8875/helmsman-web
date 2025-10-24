<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <h2 class="title">登录 Helmsman</h2>
      <el-form :model="form" ref="formRef" label-position="top" @submit.prevent>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" round :loading="loading" @click="onSubmit" class="submit-btn">登录</el-button>
        </el-form-item>
        <div class="link-row">
          <el-button link @click="goRegister">没有账号？去注册</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

// 登录表单数据
interface LoginForm {
  username: string
  password: string
}

const form = ref<LoginForm>({ username: '', password: '' })
const formRef = ref()
const loading = ref(false)

const router = useRouter()
const userStore = useUserStore()

// 点击登录时，调用 Pinia store 的 login action
const onSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    // 简单校验：避免空值提交
    ElMessage.warning('请输入用户名和密码')
    return
  }
  try {
    loading.value = true
    await userStore.login({ ...form.value })
    // 成功后会在 store 中进行路由跳转至 /dashboard
  } catch (error: unknown) {
    // 错误提示由拦截器或 store 处理，这里兜底提示
    ElMessage.error('登录失败，请检查账号或稍后再试')
  } finally {
    loading.value = false
  }
}

const goRegister = () => {
  router.push('/register')
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

.login-card {
  width: 360px;
}

.title {
  text-align: center;
  margin-bottom: 12px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: #fff;
  box-shadow: 0 6px 12px rgba(79, 70, 229, 0.35);
  transition: transform 0.08s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.submit-btn:hover {
  filter: brightness(1.05);
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.4);
}
.submit-btn:active {
  transform: translateY(1px);
}
.submit-btn[disabled] {
  filter: grayscale(0.2) brightness(0.95);
  box-shadow: none;
}
.link-row {
  display: flex;
  justify-content: center;
}
</style>