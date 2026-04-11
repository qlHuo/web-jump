import db from '@/db'
import type { Directory } from '@/db/models'
import { handleError } from '@/db/utils/handleError'
import { uuid } from '@/utils/index'

// 获取下一个 order 值
const getNextOrder = async (): Promise<number> => {
  const lastDirectory = await db.directories.orderBy('order').last()
  return lastDirectory ? (lastDirectory.order || 0) + 1 : 0
}

type DirectoryQueryParams = {
  name?: string
}

export default {
  // 创建目录
  create: async (
    directory: Omit<Directory, 'id' | 'createdAt' | 'updatedAt' | 'order'> & {
      order?: number
    }
  ): Promise<string> => {
    return handleError(async () => {
      // 1. 空值校验：目录名称和键值不能为空
      if (!directory.name || !directory.key) {
        throw new Error('目录名称和键值不能为空')
      }

      // 2. 重复校验：校验名称是否已存在
      const existingByName = await db.directories.where('name').equals(directory.name).count()
      console.log('existingByName', existingByName)
      if (existingByName > 0) {
        throw new Error('目录名称已存在，请更换名称')
      }

      // 3. 重复校验：校验键值是否已存在
      const existingByKey = await db.directories.where('key').equals(directory.key).count()
      console.log('existingByKey', existingByKey)
      if (existingByKey > 0) {
        throw new Error('目录键值已存在，请更换键值')
      }

      // 4. 创建目录
      const id = uuid()
      const now = new Date()
      const order = directory.order ?? (await getNextOrder())
      await db.directories.add({
        ...directory,
        id,
        createdAt: now,
        updatedAt: now,
        order,
      })
      return id
    }, '创建目录')
  },

  // 获取目录列表
  getDirectoryList: async (data: DirectoryQueryParams): Promise<Directory[]> => {
    const { name = '' } = data
    return await db.directories
      .filter(item => {
        if (name) {
          return item.name.includes(String(name))
        }
        return true
      })
      .sortBy('order')
  },

  // 查询单个目录详情
  getById: async (id: string): Promise<Directory | undefined> => {
    return handleError(async () => {
      return await db.directories.get(id)
    }, '获取目录详情')
  },

  // 更新目录
  update: async (id: string, data: Partial<Omit<Directory, 'id' | 'createdAt' | 'updatedAt'>>): Promise<object> => {
    return handleError(async () => {
      const result = await db.directories.update(id, {
        ...data,
        updatedAt: new Date(),
      })
      if (result === 0) {
        throw new Error('目录不存在')
      }
      return {
        ...data,
        id,
        updatedAt: new Date(),
      }
    }, '更新目录')
  },

  // 删除目录（级联删除分类和网站）
  delete: async (id: string): Promise<string> => {
    return handleError(async () => {
      await db.transaction('rw', [db.directories, db.categories, db.websites], async () => {
        await db.websites.where('directoryId').equals(id).delete()
        await db.categories.where('directoryId').equals(id).delete()
        await db.directories.delete(id)
      })
      return id
    }, '删除目录')
  },

  // 批量操作
  bulkCreate: async (directories: Omit<Directory, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> => {
    return handleError(async () => {
      const now = new Date()
      const items = directories.map(dir => ({
        ...dir,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }))
      await db.directories.bulkAdd(items)
    }, '批量创建目录')
  },
}
