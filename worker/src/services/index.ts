// src/services/api.ts
import { Env, ApiResponse } from '../config'
import { fetchWebsiteMetadata } from './metadata'
import { getFullDataset, pushFullDataset, getAllVersions, getLatestVersion } from './github'

/**
 * 处理 CORS 预检请求
 * @returns CORS 预检响应
 */
export function handleCORS(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400', // 24小时缓存
    },
  })
}

/**
 * 处理认证失败
 * @returns 401 响应
 */
export function handleAuthFailure(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Unauthorized: Invalid or missing Authorization header',
    } satisfies ApiResponse),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}

/**
 * 处理 URL 元数据请求
 * @param url - 目标 URL
 * @returns 元数据响应
 */
export async function handleMetaRequest(url: string): Promise<Response> {
  if (!url) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Missing url parameter',
      } satisfies ApiResponse),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  // 验证 URL 格式
  try {
    new URL(url)
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid URL format',
      } satisfies ApiResponse),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  const metadata = await fetchWebsiteMetadata(url)

  return new Response(
    JSON.stringify({
      success: true,
      data: metadata,
    } satisfies ApiResponse<typeof metadata>),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    }
  )
}

/**
 * 处理数据推送请求
 * @param body - 请求体
 * @param env - 环境变量
 * @returns 推送结果响应
 */
export async function handleDataPush(
  body: { directory: []; categories: []; websites: []; versions: [] },
  env: Env
): Promise<Response> {
  // 验证必需字段
  const requiredFiles = ['directory', 'categories', 'websites', 'versions'] as const
  for (const file of requiredFiles) {
    if (!body[file]) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Missing required field: ${file}`,
        } satisfies ApiResponse),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }
  }

  // 验证数据结构
  try {
    JSON.stringify(body.directory)
    JSON.stringify(body.categories)
    JSON.stringify(body.websites)
    JSON.stringify(body.versions)
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid JSON data structure',
      } satisfies ApiResponse),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  const success = await pushFullDataset(body, env)

  return new Response(
    JSON.stringify({
      success,
      message: success ? 'Data updated successfully' : 'Failed to update data',
    } satisfies ApiResponse),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}

/**
 * 处理数据获取请求
 * @param env - 环境变量
 * @returns 数据集响应
 */
export async function handleDataFetch(env: Env): Promise<Response> {
  const responseData = await getFullDataset(env)

  return new Response(
    JSON.stringify({
      success: true,
      data: responseData,
    } satisfies ApiResponse<typeof responseData>),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache', // 不缓存，确保获取最新数据
      },
    }
  )
}

/**
 * @Description 获取最新版本
 */
export async function handleLatestVersion(env: Env): Promise<Response> {
  const responseData = await getLatestVersion(env)
  return new Response(
    JSON.stringify({
      success: true,
      data: responseData,
    } satisfies ApiResponse<typeof responseData>),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache', // 不缓存，确保获取最新数据
      },
    }
  )
}

// 获取所有版本
export async function handleAllVersions(env: Env): Promise<Response> {
  const responseData = await getAllVersions(env)
  return new Response(
    JSON.stringify({
      success: true,
      data: responseData,
    } satisfies ApiResponse<typeof responseData>),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache', // 不缓存，确保获取最新数据
      },
    }
  )
}

/**
 * 处理 404 错误
 * @returns 404 响应
 */
export function handleNotFound(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      message: '404 not found.',
    } satisfies ApiResponse),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}

/**
 * 处理服务器错误
 * @param error - 错误对象
 * @returns 500 响应
 */
export function handleServerError(error: unknown): Response {
  console.error('Handler error:', error)
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Internal server error',
    } satisfies ApiResponse),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
