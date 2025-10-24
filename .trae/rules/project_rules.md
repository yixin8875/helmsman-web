# Helmsman 项目前端开发规范 (project_rule.md)

## 1. 项目概述

**Helmsman** 是一款面向个人交易者的交易日志记录与分析系统。本项目旨在提供一个从交易计划、执行到复盘的全周期管理工具，帮助用户通过数据分析提升交易决策能力。

本文档定义了 Helmsman 前端项目的开发规范、技术选型和协作流程，旨在确保代码的可读性、可维护性和团队协作的高效性。

---

## 2. 技术选型 (Tech Stack)

*   **核心框架:** [Vue 3](https://vuejs.org/) (使用 `<script setup>` 语法和组合式 API)
*   **构建工具:** [Vite](https://vitejs.dev/)
*   **编程语言:** [TypeScript](https://www.typescriptlang.org/)
*   **路由管理:** [Vue Router](https://router.vuejs.org/)
*   **状态管理:** [Pinia](https://pinia.vuejs.org/)
*   **UI 组件库:** [Element Plus](https://element-plus.org/) (推荐，组件丰富，适合数据驱动的后台管理系统)
*   **HTTP 请求库:** [Axios](https://axios-http.com/)
*   **代码规范:**
    *   [ESLint](https://eslint.org/) (配合 `@typescript-eslint/parser`)
    *   [Prettier](https://prettier.io/) (统一代码风格)
*   **CSS 预处理器:** [Sass/SCSS](https://sass-lang.com/) (使用 `scoped` 样式)

---

## 3. 项目结构

项目将遵循标准的 Vite + Vue 3 结构，核心代码位于 `src` 目录下。

```
helmsman-frontend/
├── public/                  # 静态资源，不会被 Webpack 处理
├── src/
│   ├── api/                 # API 请求模块 (按功能划分, e.g., trade.ts, user.ts)
│   ├── assets/              # 静态资源 (图片, 字体等)
│   ├── components/          # 全局通用组件 (e.g., SvgIcon.vue, EquityChart.vue)
│   ├── layout/              # 布局组件 (e.g., MainLayout.vue, 包括侧边栏、顶部导航)
│   ├── router/              # 路由配置 (index.ts)
│   ├── store/               # Pinia 状态管理 (e.g., user.ts, trade.ts)
│   ├── styles/              # 全局样式和变量 (e.g., variables.scss, global.scss)
│   ├── types/               # TypeScript 类型定义 (e.g., api.d.ts, trade.d.ts)
│   ├── utils/               # 工具函数 (e.g., request.ts, date.ts)
│   ├── views/ (或 pages/)   # 页面级组件 (对应一个路由)
│   └── main.ts              # 应用入口文件
├── .env.development         # 开发环境变量
├── .env.production          # 生产环境变量
├── .eslintrc.cjs            # ESLint 配置文件
├── .prettierrc.json         # Prettier 配置文件
├── index.html               # HTML 入口文件
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置文件
└── vite.config.ts           # Vite 配置文件
```

---

## 4. 编码规范

### 4.1. 命名规范

*   **组件文件:** 使用大驼峰命名法 (PascalCase)，例如 `TradeDetail.vue`。
*   **TS/JS 文件:** 使用小驼峰命名法 (camelCase)，例如 `useCounter.ts`。
*   **变量/函数:** 使用小驼峰命名法，例如 `const tradeList = ...`, `function getTrades() {}`。
*   **常量:** 全部大写，用下划线分隔，例如 `const MAX_TRADES = 100;`。
*   **路由 `name`:** 使用大驼峰命名法，与组件名保持一致，例如 `name: 'Dashboard'`。

### 4.2. Vue 组件规范

*   **强制使用 `<script setup>` 语法。**
*   **组件通信:**
    *   父传子：使用 `defineProps`，Props 命名使用小驼峰。
    *   子传父：使用 `defineEmits`，事件命名使用 kebab-case，例如 `update:modelValue`。
*   **组件封装:** 高度可复用的组件应抽离到 `src/components` 目录。业务耦合度高的组件可放在 `views` 对应页面的子目录中。
*   **样式:** 默认使用 `<style lang="scss" scoped>`，避免全局样式污染。全局样式应放在 `src/styles` 目录下。

### 4.3. TypeScript 规范

*   **为所有 API 接口数据、Pinia state、函数参数和返回值定义明确的类型。** 类型定义文件统一放在 `src/types` 目录下。
*   **善用 `interface` 和 `type`**。`interface` 用于定义对象结构，`type` 用于联合类型、交叉类型等。
*   **避免使用 `any` 类型**，除非在特殊情况下无法避免。

---

## 5. API 通信规范

这是前后端协作的核心，请严格遵守。

### 5.1. 请求封装

所有 API 请求将通过 `src/utils/request.ts` 中封装的 Axios 实例发出。该实例将统一处理：
*   `baseURL` 的设置。
*   请求头 `headers` 的统一注入（例如 `Authorization` Token）。
*   请求和响应拦截器，用于统一的加载动画 (Loading) 和错误处理。

### 5.2. API 模块化

API 请求函数将按后端模块划分，存放在 `src/api` 目录下。例如：

`src/api/trade.ts`:
```typescript
import request from '@/utils/request';
import { Trade, TradeListResponse } from '@/types/trade';

// 获取交易列表
export const getTradeList = (params: any) => {
  return request<TradeListResponse>({
    url: '/trades',
    method: 'get',
    params
  });
}

// 创建新交易
export const createTrade = (data: Trade) => {
  return request({
    url: '/trades',
    method: 'post',
    data
  });
}
```

### 5.3. 数据返回格式 (后端 -> 前端)

后端返回的所有响应体必须遵循统一的 JSON 结构：

```json
{
  "code": 200, // 业务状态码 (200: 成功, 401: 未授权, 500: 服务器错误, 其他自定义)
  "msg": "操作成功", // 提示信息
  "data": {} // 实际返回的数据 (可以是对象或数组)
}
```
*   **成功示例:**
    ```json
    {
      "code": 200,
      "msg": "获取交易列表成功",
      "data": {
        "items": [
          { "id": 1, "symbol": "BTCUSDT", "pnl": 150.5 },
          { "id": 2, "symbol": "ETHUSDT", "pnl": -50.0 }
        ],
        "total": 2
      }
    }
    ```
*   **失败示例:**
    ```json
    {
      "code": 4001, // 自定义业务错误码，例如“参数校验失败”
      "msg": "交易品种不能为空",
      "data": null
    }
    ```

### 5.4. 认证机制

*   登录成功后，后端返回一个 JWT (JSON Web Token)。
*   前端将 Token 存储在 `localStorage` 或 `Pinia` 中。
*   之后的所有请求，在请求头中携带 `Authorization: Bearer <token>`。
*   如果后端返回 `code: 401` 或 HTTP 状态码 `401 Unauthorized`，前端将清除 Token 并重定向到登录页。

---

## 6. Git 工作流

*   **分支策略:**
    *   `main`: 主分支，对应线上生产环境，只接受来自 `develop` 的合并。
    *   `develop`: 开发分支，是所有功能分支的合并目标。
    *   `feature/xxx`: 功能分支，从 `develop` 创建，用于开发新功能。例如 `feature/trade-list-page`。
    *   `fix/xxx`: Bug 修复分支，从 `develop` 或 `main` 创建。
*   **Commit 规范:**
    *   遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。
    *   格式: `<type>(<scope>): <subject>`
    *   常用 `type`:
        *   `feat`: 新功能
        *   `fix`: 修复 Bug
        *   `docs`: 文档变更
        *   `style`: 代码风格调整 (不影响逻辑)
        *   `refactor`: 代码重构
        *   `perf`: 性能优化
        *   `chore`: 构建过程或辅助工具的变动
    *   **示例:** `feat(trade): add trade creation form`

*   **协作流程:**
    1.  从 `develop` 分支创建新的 `feature` 分支。
    2.  在功能分支上进行开发。
    3.  开发完成后，提交代码并推送到远程仓库。
    4.  创建 Pull Request (PR) 到 `develop` 分支。
    5.  经过 Code Review 后，合并 PR 到 `develop`。

---

## 7. 环境变量

所有环境相关的变量都应在 `.env` 文件中定义。

*   `.env.development` (开发环境):
    ```
    # API 基础路径
    VITE_APP_API_BASE_URL=/api
    ```
*   `.env.production` (生产环境):
    ```
    # API 基础路径
    VITE_APP_API_BASE_URL=https://api.helmsman.com
    ```
*   **注意:** 所有环境变量必须以 `VITE_` 开头才能在客户端代码中访问。

---

本文档是 Helmsman 项目前端开发的指导原则。随着项目进展，本文档可能会进行更新和完善。

**让我们一起打造一个出色的产品！**