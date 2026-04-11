import { Dexie } from 'dexie'

// ======================
// 错误类型定义（纯数据结构）
// ======================

/** 通用应用错误 */
export interface AppError {
  type: 'APP_ERROR'
  message: string
  code: string
  details?: Record<string, unknown>
  originalError?: unknown
}

/** 数据库错误 */
export interface DbError extends Omit<AppError, 'type'> {
  type: 'DB_ERROR'
  dexieErrorName: string
}

/** 业务逻辑错误 */
export interface BusinessError extends Omit<AppError, 'type'> {
  type: 'BUSINESS_ERROR'
}

export type ApplicationError = AppError | DbError | BusinessError

// ======================
// 错误分析器（无副作用）
// ======================

const DEXIE_ERROR_MESSAGES: Record<string, string> = {
  ConstraintError: '数据已存在，请检查输入内容',
  NotFoundError: '请求的数据不存在',
  OpenFailedError: '数据库初始化失败，请刷新页面重试',
  VersionChangeError: '数据结构版本冲突，请清除浏览器缓存后重试',
  QuotaExceededError: '本地存储空间已满，请清理浏览器数据',
  TransactionInactiveError: '数据库操作超时，请稍后重试',
  AbortError: '操作被取消',
  InvalidStateError: '数据库状态异常，请刷新页面',
}

/**
 * 分析原始错误，返回结构化的应用错误
 */
export function analyzeError(
  error: unknown,
  context: string = ''
): ApplicationError {
  // 如果已经是应用错误，直接返回
  if (isApplicationError(error)) {
    return error
  }

  // Dexie 错误处理
  if (error instanceof Dexie.DexieError) {
    return {
      type: 'DB_ERROR',
      dexieErrorName: error.name,
      message:
        DEXIE_ERROR_MESSAGES[error.name] ||
        `${context ? `${context}: ` : ''}${error.message}`,
      code: `DEXIE_${error.name.toUpperCase()}`,
      originalError: error,
      details: {
        context,
        innerError: error.inner,
      },
    }
  }

  // JavaScript 原生错误
  if (error instanceof Error) {
    return {
      type: 'APP_ERROR',
      message: `${context ? `${context}: ` : ''}${error.message}`,
      code: 'JS_ERROR',
      originalError: error,
      details: {
        context,
        stack: error.stack,
        name: error.name,
      },
    }
  }

  // 其他类型错误（字符串、对象等）
  return {
    type: 'APP_ERROR',
    message: `${context ? `${context}: ` : ''}${String(error)}`,
    code: 'UNKNOWN_ERROR',
    originalError: error,
    details: { context },
  }
}

function isApplicationError(error: unknown): error is ApplicationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    ['APP_ERROR', 'DB_ERROR', 'BUSINESS_ERROR'].includes(
      (error as { type: string }).type
    )
  )
}

// ======================
// 服务层错误处理包装器
// ======================

/**
 * 包装异步操作，统一错误格式（不显示 UI 提示）
 */
export async function handleError<T>(
  operation: () => Promise<T>,
  context: string = '操作'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    // 转换为结构化错误并重新抛出
    throw analyzeError(error, context)
  }
}
