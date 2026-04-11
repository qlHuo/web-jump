import type { Directory, Category, Website } from '@/db/models'

export const DEFAULT_DIRECTORIES: Omit<
  Directory,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  { name: 'AI工具', order: 0, key: 'ai' },
  { name: '实用工具', order: 1, key: 'tools' },
  { name: '技术开发', order: 2, key: 'dev' },
]

export const DEFAULT_CATEGORIES: Omit<
  Category,
  'id' | 'createdAt' | 'updatedAt'
>[] = [
  { name: 'AI助手', directoryId: 'ai', order: 0 },
  { name: 'AI图像', directoryId: 'ai', order: 1 },
  { name: 'AI编程', directoryId: 'ai', order: 2 },
]

export const DEFAULT_WEBSITES: Omit<
  Website,
  'id' | 'createdAt' | 'updatedAt'
>[] = []
