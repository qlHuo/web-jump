// src/config.ts
export interface Env {
  AUTH_SECRET: string
  GITHUB_TOKEN: string
  REPO_OWNER: string
  REPO_NAME: string
  BRANCH_NAME: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

// 常量配置
export const GITHUB_API_BASE = 'https://api.github.com'
export const DEFAULT_BRANCH = 'main'
export const FILE_PATHS = {
  DIRECTORY: 'data/directory.json',
  CATEGORIES: 'data/categories.json',
  WEBSITES: 'data/websites.json',
  VERSIONS: 'data/versions.json',
} as const

// 需要权限控制的接口
export const AUTH_PATH = ['/api/push-websites-data']
