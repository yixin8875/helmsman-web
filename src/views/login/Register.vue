<template>
  <div class="register-page">
    <el-card class="register-card" shadow="hover">
      <h2 class="title">注册 Helmsman</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱（可选）" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" round :loading="loading" @click="onSubmit" class="submit-btn">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="link-row">
        <el-button link @click="goLogin">已有账号？去登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerApi } from '@/api/user'

interface RegisterForm {
  username: string
  email?: string
  password: string
  confirmPassword: string
}

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = ref<RegisterForm>({ username: '', email: '', password: '', confirmPassword: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 32, message: '用户名长度为 2-32 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码长度为 6-64 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_: any, value: string, callback: (err?: Error) => void) => {
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

const onSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    const { username, password, email } = form.value
    await registerApi(username, password, email)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: unknown) {
    if (error) {
      ElMessage.error('注册失败，请稍后重试或检查填写信息')
    }
  } finally {
    loading.value = false
  }
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
}

.register-card {
  width: 420px;
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
  margin-top: 8px;
  display: flex;
  justify-content: center;
}
</style>