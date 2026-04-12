// src/index.ts
import { Env, AUTH_PATH } from './config'
import { authenticate } from './utils/auth'
import {
  handleCORS,
  handleAuthFailure,
  handleMetaRequest,
  handleDataPush,
  handleDataFetch,
  handleLatestVersion,
  handleAllVersions,
  handleNotFound,
  handleServerError,
} from './services'

export default {
  // env 是由 Wrangler 自动注入的，包含所有 secrets
  async fetch(request: Request, env: Env, ctx: object): Promise<Response> {
    return handleRequest(request, env)
  },
}

/**
 * 主要处理函数
 */
async function handleRequest(request: Request, env: Env): Promise<Response> {
  // CORS 预检请求处理
  if (request.method === 'OPTIONS') {
    return handleCORS()
  }

  const url = new URL(request.url)
  const path = url.pathname

  // 认证检查
  if (AUTH_PATH.includes(path) && !authenticate(request, env)) {
    return handleAuthFailure()
  }

  try {
    // 接口 1: 获取 URL 元数据 - GET /api/get-meta-by-url?url={url}
    if (path === '/api/get-meta-by-url' && request.method === 'GET') {
      const targetUrl = url.searchParams.get('url')
      return await handleMetaRequest(targetUrl || '')
    }

    // 接口 2: 推送完整数据集 - POST /api/push-websites-data
    // 包含directory.json categories.json websites.json versions.json
    if (path === '/api/push-websites-data' && request.method === 'POST') {
      const body = await request.json()
      return await handleDataPush(body, env)
    }

    // 接口 3: 获取完整数据集 - GET /api/get-websites-data
    if (path === '/api/get-websites-data' && request.method === 'GET') {
      return await handleDataFetch(env)
    }

    // 接口4： 获取最新版本 - GET
    if (path === '/api/get-latest-version' && request.method === 'GET') {
      return await handleLatestVersion(env)
    }

    // 接口5： 获取全部版本 - GET
    if (path === '/api/get-all-versions' && request.method === 'GET') {
      return await handleAllVersions(env)
    }

    // 默认响应：404
    return handleNotFound()
  } catch (error) {
    return handleServerError(error)
  }
}
