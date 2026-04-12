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
  DIRECTORY: 'directory.json',
  CATEGORIES: 'categories.json',
  WEBSITES: 'websites.json',
} as const

// 不验证的接口
export const NO_AUTH_PATH = ['/api/meta']
