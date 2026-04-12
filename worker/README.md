# Cloudflare Workers 部署完整指南

要将本地的 Cloudflare Worker 函数部署到线上，需要使用 **Wrangler CLI**（Cloudflare 官方命令行工具）。以下是完整的部署流程：

## 📋 1. 环境准备

### 安装 Node.js

确保你已安装 Node.js（推荐 LTS 版本）：

```bash
node --version  # 应该显示 v18.x 或更高版本
npm --version   # 应该显示 8.x 或更高版本
```

### 安装 Wrangler CLI

**推荐方式：使用 npx（无需全局安装）**

```bash
# 直接使用 npx 调用 wrangler
npx wrangler --version
```

**或者全局安装：**

```bash
npm install -g wrangler
wrangler --version
```

## ⚙️ 2. 项目配置

### 创建 wrangler.toml 配置文件

在woker根目录创建 `wrangler.toml` 文件：

```toml
# wrangler.toml
name = "website-manager-api"
main = "src/index.ts"
compatibility_date = "2026-04-12"

# 环境变量配置
[vars]
# 这些变量会在部署时从 Cloudflare 控制台读取
# 本地开发时从 .dev.vars 文件读取

# 如果需要其他配置（如 D1 数据库、R2 存储等），可以在这里添加
```

### 创建 .dev.vars 文件（本地开发用）

在项目根目录创建 `.dev.vars` 文件，用于本地开发时的环境变量：

```env
# .dev.vars
AUTH_SECRET=your_auth_secret_here
GITHUB_TOKEN=your_github_token_here
REPO_OWNER=your_github_username
REPO_NAME=your_repo_name
BRANCH_NAME=main
```

> ⚠️ **重要**：`.dev.vars` 文件应该添加到 `.gitignore` 中，不要提交到版本控制！

## 🔐 3. 认证 Cloudflare 账户

### 登录 Wrangler

```bash
npx wrangler login
```

这会打开浏览器，让你授权 Wrangler 访问你的 Cloudflare 账户。

## 🧪 4. 本地开发和测试

### 启动本地开发服务器

```bash
npx wrangler dev
```

这会在 `http://localhost:8787` 启动你的 Worker，并支持热重载。

### 测试你的 API

```bash
# 测试元数据获取
curl "http://localhost:8787/api/meta?url=https://google.com" \
  -H "Authorization: your_auth_secret_here"

# 测试数据获取
curl "http://localhost:8787/api/data" \
  -H "Authorization: your_auth_secret_here"
```

## 🚀 5. 部署到生产环境

### 部署命令

```bash
npx wrangler deploy
```

### 部署特定环境

```bash
# 部署到生产环境
npx wrangler deploy --env production

# 部署到预发布环境
npx wrangler deploy --env staging
```

## 🔧 6. 环境变量管理

### 在 Cloudflare 控制台设置环境变量

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → 选择你的 Worker
3. 点击 **Settings** → **Variables**
4. 添加以下环境变量：

| 变量名         | 值                           |
| -------------- | ---------------------------- |
| `AUTH_SECRET`  | 你的认证密钥                 |
| `GITHUB_TOKEN` | GitHub Personal Access Token |
| `REPO_OWNER`   | GitHub 仓库所有者            |
| `REPO_NAME`    | GitHub 仓库名称              |
| `BRANCH_NAME`  | 分支名称（如 main）          |

### 使用 Wrangler CLI 设置环境变量

```bash
# 设置单个变量
npx wrangler secret put AUTH_SECRET

# 批量设置（需要创建 secrets.json 文件）
npx wrangler secret bulk --file secrets.json
```

`secrets.json` 示例：

```json
{
  "AUTH_SECRET": "your_secret_value",
  "GITHUB_TOKEN": "your_github_token",
  "REPO_OWNER": "your_username",
  "REPO_NAME": "your_repo",
  "BRANCH_NAME": "main"
}
```

## 🔄 7. 自动化部署（GitHub Actions）

如果你使用 GitHub，可以设置自动部署：

### 创建 `.github/workflows/deploy.yml`

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Publish to Cloudflare Workers
        uses: cloudflare/wrangler-action@2.0.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 在 GitHub Secrets 中设置

1. `CLOUDFLARE_API_TOKEN` - Cloudflare API Token
2. `CLOUDFLARE_ACCOUNT_ID` - Cloudflare 账户 ID

## 📊 8. 验证部署

### 查看部署状态

```bash
npx wrangler deployments
```

### 查看日志

```bash
# 实时日志
npx wrangler tail

# 带过滤的日志
npx wrangler tail --search "error"
```

### 测试线上 API

```bash
# 替换为你的实际 Worker URL
curl "https://website-manager-api.your-subdomain.workers.dev/api/data" \
  -H "Authorization: your_auth_secret_here"
```

## 🛠️ 常见问题解决

### 1. 部署失败：权限不足

- 确保 API Token 有 **Account.Worker Scripts Edit** 权限
- 确保账户有 **Workers** 服务权限

### 2. 环境变量未生效

- 检查变量是否在 Cloudflare 控制台正确设置
- 确认变量名大小写匹配
- 重启 Worker（重新部署）

### 3. TypeScript 编译错误

- 确保 `tsconfig.json` 配置正确
- 检查依赖是否安装完整

### 4. 本地开发与线上行为不一致

- 使用 `npx wrangler dev --remote` 进行远程调试
- 检查环境变量差异

## 📁 项目结构建议

```
your-project/
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── utils/
│   └── services/
├── wrangler.toml
├── .dev.vars          # 本地开发环境变量（不要提交）
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🎯 最佳实践

1. **使用 npx 而不是全局安装**：确保团队使用相同版本
2. **环境变量分离**：`.dev.vars` 用于本地，Secrets 用于生产
3. **API Token 优于 OAuth**：更适合自动化部署
4. **定期更新 Wrangler**：保持最新功能和安全修复
5. **监控和日志**：设置适当的错误监控
