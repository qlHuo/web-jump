# Web Jump - 网站导航管理平台

![Web Jump](https://github.com/qlHuo/web-jump/raw/main/public/favicon.svg)

一个基于 Vue3 的纯前端网站导航管理平台，支持本地存储、导入导出网站数据，帮助用户高效管理和快速访问常用网站。

## 🚀 特性

- **纯前端实现**：无需后端服务，所有数据存储在浏览器本地
- **响应式设计**：适配桌面和移动设备
- **数据管理**：支持网站分类、添加、编辑、删除
- **数据导入/导出**：JSON 格式数据备份与恢复
- **搜索功能**：快速查找目标网站
- **多端同步**：通过 GitHub 实现数据云端同步
- **自动解析**：新增网站时自动获取网站信息和图标
- **Cloudflare 全栈部署**：前端 + Serverless API 一体化部署

## 🛠 技术栈

### 前端技术

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **UI 组件库**: TDesign Vue Next
- **构建工具**: Vite
- **样式**: Tailwind CSS v4
- **状态管理**: Pinia
- **路由**: Vue Router
- **本地存储**: Dexie.js (IndexedDB 封装)
- **代码规范**: ESLint + Prettier

### 后端技术（Serverless）

- **运行环境**: Cloudflare Workers
- **数据存储**: GitHub 仓库（JSON 文件）
- **认证方式**: Bearer Token 认证

### 部署技术

- **前端托管**: Cloudflare Pages
- **API 服务**: Cloudflare Workers
- **CI/CD**: GitHub Actions
- **域名管理**: Cloudflare DNS + 腾讯云

## 📁 项目结构

```
web-jump/
├── public/             # 静态资源
├── src/                # 源代码
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   ├── composables/    # 组合式函数
│   ├── db/             # 本地数据库（Dexie.js实现）
│   ├── router/         # 路由配置
│   ├── store/          # 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── data/               # 远程数据模板（存储在 GitHub）
├── worker/             # Cloudflare Workers（Serverless API）
├── scripts/            # 脚本文件（生成 sitemap 等）
├── .vscode/            # VS Code 配置
├── tailwind.config.ts  # Tailwind CSS 配置
├── vite.config.ts      # Vite 配置
├── wrangler.toml       # Cloudflare Workers 配置（已修正）
└── package.json        # 依赖配置
```

## 🚀 快速开始

### 开发环境

1. **克隆项目**

```bash
git clone https://github.com/qlHuo/web-jump.git
cd web-jump
```

2. **安装依赖**

```bash
# 推荐使用 pnpm
pnpm install
```

3. **启动开发服务器**

```bash
# 前端开发
pnpm dev

# Worker API 开发（在 worker 目录下）
cd worker
npx wrangler dev --config wrangler.toml

# 或者在根目录
npx wrangler dev --config worker/wrangler.toml
```

4. **构建生产版本**

```bash
# 构建前端
pnpm build

# 部署 Worker（在 worker 目录下）
npx wrangler deploy
```

## 🌐 生产部署（完整流程）

### 第一步：准备 GitHub 仓库

1. **Fork 本项目**到你的 GitHub 账户
2. **创建 Personal Access Token**
   - 访问 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - 创建新 token，勾选 `repo` 权限
   - 保存 token（只显示一次！）

### 第二步：部署 Cloudflare Worker（API 服务）

#### 1. 配置 Worker 项目

进入 `worker` 目录，确保 `wrangler.toml` 配置正确：

```toml
# worker/wrangler.toml
name = "web-jump-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# 环境变量将在部署时从 Cloudflare 控制台读取
# 本地开发使用 .dev.vars 文件
```

#### 2. 设置本地开发环境变量

在 `worker` 目录创建 `.dev.vars` 文件：

```env
# worker/.dev.vars
AUTH_SECRET=your_strong_auth_secret
GITHUB_TOKEN=your_github_personal_access_token
REPO_OWNER=your_github_username
REPO_NAME=web-jump
BRANCH_NAME=main
```

> ⚠️ **重要**：将 `.dev.vars` 添加到 `.gitignore`，不要提交到版本控制！

#### 3. 认证并部署 Worker

```bash
# 在 worker 目录下执行
cd worker

# 登录 Cloudflare 账户
npx wrangler login

# 部署到生产环境
npx wrangler deploy
```

#### 4. 在 Cloudflare 控制台设置生产环境变量

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 找到你的 Worker（web-jump-api）
3. 点击 **Settings** → **Variables**
4. 在 **Secrets** 部分添加以下变量：

| 变量名         | 值                                   |
| -------------- | ------------------------------------ |
| `AUTH_SECRET`  | 你的认证密钥（建议使用强密码生成器） |
| `GITHUB_TOKEN` | GitHub Personal Access Token         |
| `REPO_OWNER`   | 你的 GitHub 用户名                   |
| `REPO_NAME`    | 仓库名称（web-jump）                 |
| `BRANCH_NAME`  | 分支名称（main）                     |

### 第三步：部署 Cloudflare Pages（前端）

1. **在 Cloudflare Dashboard 创建新 Pages 项目**
   - 选择你的 GitHub 仓库
   - 项目名称：`web-jump`
   - 构建配置：
     - Framework preset: **Vite**
     - Build command: `pnpm build`
     - Output directory: `dist`
     - Root directory: （留空）

2. **配置环境变量（可选）**
   - 如果需要自定义 API 地址，在 **Environment variables** 中添加：
     - `VITE_API_URL`: `https://web-jump-api.your-subdomain.workers.dev`

3. **触发首次部署**
   - 保存配置后，Cloudflare 会自动开始构建和部署

### 第四步：域名配置（腾讯云 + Cloudflare）

#### 方案 A：完全托管到 Cloudflare（推荐）

1. **在腾讯云修改域名 DNS 服务器**
   - 登录腾讯云控制台
   - 进入域名管理 → DNS 修改
   - 将 DNS 服务器改为 Cloudflare 提供的 NS 记录：
     ```
     lara.ns.cloudflare.com
     rick.ns.cloudflare.com
     ```

2. **在 Cloudflare 添加域名**
   - 在 Cloudflare Dashboard 点击 **Add a Site**
   - 输入你的域名（如：nav.yourdomain.com）
   - 选择免费计划

3. **配置自定义域名**
   - 在 Pages 项目中，进入 **Custom domains**
   - 添加你的自定义域名（如：nav.yourdomain.com）
   - Cloudflare 会自动处理 SSL 证书

#### 方案 B：CNAME 解析（保留腾讯云 DNS）

1. **在腾讯云添加 CNAME 记录**
   - 主机记录：`nav`（或你想要的子域名）
   - 记录类型：`CNAME`
   - 记录值：`your-project.pages.dev`（Pages 分配的域名）
   - 线路类型：默认

2. **配置 Cloudflare Proxy**
   - 在 Cloudflare DNS 设置中，确保该记录的代理状态为 **Proxied**（橙色云朵）

### 第五步：验证部署

1. **测试 API 服务**

```bash
curl "https://web-jump-api.your-subdomain.workers.dev/api/data" \
  -H "Authorization: Bearer your_auth_secret"
```

2. **访问前端页面**
   - 打开 `https://nav.yourdomain.com` 或 Cloudflare Pages 分配的域名
   - 进入 `/admin` 页面进行管理

## 👥 用户使用指南

### 基础使用（访客模式）

- **浏览网站**：直接访问首页查看所有网站
- **搜索网站**：使用顶部搜索框快速查找
- **访问网站**：点击网站卡片跳转到目标网站

### 管理功能（管理员模式）

进入管理页面 `/admin` 进行自定义配置：

#### 基本操作

1. **目录管理**：创建、编辑、删除网站分类
2. **网站管理**：增删改查网站信息
3. **自动解析**：新增网站时自动获取标题、描述、favicon

#### 数据管理

1. **导出数据**
   - 点击 "导出数据" 按钮
   - 下载 JSON 格式的数据文件（仅包含本地数据）

2. **导入数据**
   - 点击 "导入数据" 按钮
   - 选择 JSON 文件进行导入
   - 支持合并或覆盖模式

3. **同步远程数据**
   - 点击 "同步数据" 按钮
   - 从 GitHub 仓库拉取最新数据
   - **增量同步**：不会删除本地新增的数据

4. **推送数据（仅网站所有者）**
   - 点击 "推送数据" 按钮
   - 输入授权码（即 `AUTH_SECRET` 的值）
   - 将本地数据推送到 GitHub 仓库

## 🔧 配置说明

### 环境变量配置

#### Worker API 环境变量

```env
# 必需的环境变量
AUTH_SECRET=your_strong_auth_secret
GITHUB_TOKEN=github_pat_xxx
REPO_OWNER=your_github_username
REPO_NAME=web-jump
BRANCH_NAME=main
```

#### 前端环境变量（可选）

```env
# .env.local
VITE_API_URL=https://your-worker-subdomain.workers.dev
VITE_APP_TITLE=My Web Jump
VITE_DEFAULT_CATEGORY=常用网站
```

### Tailwind CSS 配置

## 🐞 常见问题

### 1. 数据同步失败

- **原因**：GitHub Token 权限不足或已过期
- **解决方案**：重新生成具有 `repo` 权限的 Personal Access Token

### 2. Worker 部署 403 错误

- **原因**：Cloudflare 账户缺少 Workers 权限
- **解决方案**：确保账户已激活 Workers 服务（免费计划支持）

### 3. 自定义域名 SSL 证书问题

- **原因**：DNS 配置未完成或代理状态错误
- **解决方案**：
  - 确保 DNS 记录状态为 **Proxied**（橙色云朵）
  - 等待 SSL 证书自动颁发（通常 15-30 分钟）

### 4. 本地开发 API 调用失败

- **原因**：前端未配置正确的 API 地址
- **解决方案**：在 `.env.local` 中设置 `VITE_API_URL=http://localhost:8787`

### 5. 图标加载缓慢

- **原因**：favicon 获取受 CORS 限制
- **解决方案**：Worker API 已内置 favicon 代理功能，确保使用最新版本

## 📊 API 接口文档

### 获取网站元数据

```
GET /api/get-meta-by-url
```

### 推送数据到github data （有认证，传github token 和 Auth Token）

```
/api/push-websites-data
```

### 获取完整数据 - GET

```
/api/get-websites-data
```

### 获取最新版本 - GET

```
/api/get-latest-version
```

### 获取全部版本 - GET

```
/api/get-all-versions
```

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

> **安全提示**：`AUTH_SECRET` 是保护你数据安全的关键，请使用强密码并妥善保管。不要将敏感信息提交到版本控制系统中。
