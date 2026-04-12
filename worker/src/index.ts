// src/index.ts
import { Env, NO_AUTH_PATH } from './config'
import { authenticate } from './utils/auth'
import {
  handleCORS,
  handleAuthFailure,
  handleMetaRequest,
  handleDataPush,
  handleDataFetch,
  handleNotFound,
  handleServerError,
} from './services'

export default {
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

  // 非白名单的需要走认证检查
  if (!NO_AUTH_PATH.includes(path) && !authenticate(request, env)) {
    return handleAuthFailure()
  }

  try {
    // 接口 1: 获取 URL 元数据 - GET /api/meta?url={url}
    if (path === '/api/meta' && request.method === 'GET') {
      const targetUrl = url.searchParams.get('url')
      return await handleMetaRequest(targetUrl || '')
    }

    // 接口 2: 推送完整数据集 - POST /api/data
    if (path === '/api/data' && request.method === 'POST') {
      const body = await request.json()
      return await handleDataPush(body, env)
    }

    // 接口 3: 获取完整数据集 - GET /api/data
    if (path === '/api/data' && request.method === 'GET') {
      return await handleDataFetch(env)
    }

    // 默认响应：404
    return handleNotFound()
  } catch (error) {
    return handleServerError(error)
  }
}
