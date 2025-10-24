<template>
  <!-- 主应用经典后台布局：左侧菜单栏 + 顶部导航 + 中间内容 -->
  <el-container class="layout">
    <!-- 左侧菜单栏 -->
    <el-aside width="200px" class="layout-aside">
      <div class="brand">Helmsman</div>
      <!-- TODO: 后续补充实际菜单 -->
    </el-aside>

    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="layout-header">
        <div class="header-left"></div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="32" class="avatar">HM</el-avatar>
              <el-icon class="el-icon--right"><i class="el-icon-arrow-down"></i></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 中间内容区：用于展示子页面 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
// 布局组件使用 Element Plus 进行基础结构搭建
// 退出登录的逻辑将在后续与 Pinia store 结合实现
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
}

.layout-aside {
  background: #0f172a; /* slate-900 */
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  .brand {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.layout-main {
  background: #f8fafc; /* slate-50 */
  padding: 16px;
}
</style>