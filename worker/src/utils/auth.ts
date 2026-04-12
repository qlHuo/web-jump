// src/utils/auth.ts
import { Env } from '../config'

/**
 * 认证中间件
 * @param request - HTTP 请求对象
 * @param env - 环境变量
 * @returns 认证是否成功
 */
export function authenticate(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false

  // 支持 Bearer token 或直接 token
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  return token === env.AUTH_SECRET
}
