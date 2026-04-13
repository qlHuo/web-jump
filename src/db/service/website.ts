import db from '@/db'
import type {
  Website,
  FullWebsiteStructure,
  CategoryWithWebsites,
  DirectoryWithCategories,
  Directory,
  Category,
} from '@/db/models'
import { handleError } from '@/db/utils/handleError'
import { uuid } from '@/utils/index'
// 获取下一个 order 值
const getNextOrder = async (): Promise<number> => {
  const lastWebsite = await db.websites.orderBy('order').last()
  return lastWebsite ? (lastWebsite?.order || 0) + 1 : 0
}

export default {
  // 创建网站
  create: async (
    website: Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'order'> & {
      order?: number
    }
  ): Promise<string> => {
    return handleError(async () => {
      const id = uuid()
      const now = new Date()
      const order = website.order ?? (await getNextOrder())
      await db.websites.add({
        ...website,
        id,
        createdAt: now,
        updatedAt: now,
        order,
      })
      return id
    }, '创建网站')
  },

  // 查询所有的网站
  getAll: async (): Promise<Website[]> => {
    return handleError(async () => {
      return await db.websites.toArray()
    }, '获取网站列表')
  },

  // 更新网站信息
  update: async (id: string, website: Partial<Omit<Website, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    return handleError(async () => {
      await db.websites.update(id, {
        ...website,
        updatedAt: new Date(),
      })
    }, '更新网站')
  },

  // 删除网站
  delete: async (id: string): Promise<void> => {
    return handleError(async () => {
      await db.websites.delete(id)
    }, '删除网站')
  },

  // 批量删除
  batchDelete: async (ids: string[]): Promise<void> => {
    return handleError(async () => {
      const idsToDelete = ids.filter(id => id !== '')
      await db.websites.where('id').anyOf(idsToDelete).delete()
    }, '批量删除网站')
  },

  // 根据分类ID获取网站列表
  getByCategoryId: async (categoryId: string): Promise<Website[]> => {
    return handleError(async () => {
      return await db.websites.filter(_ => _.categoryId === categoryId).sortBy('order')
    }, '获取网站列表')
  },

  /**
   * 获取完整的三层网站结构数据
   * 性能优化：使用单次批量查询 + 内存分组
   */
  async getFullWebsitesStructure(): Promise<FullWebsiteStructure> {
    return handleError(async () => {
      // 1. 并行获取所有数据（减少数据库往返次数）
      const [directories, categories, websites] = await Promise.all([
        db.directories.toArray(),
        db.categories.toArray(),
        db.websites.toArray(),
      ])

      // 如果没有目录，直接返回空数组
      if (directories.length === 0) {
        return []
      }

      // 2. 创建映射表以提高查找效率
      const directoryMap = new Map<string, DirectoryWithCategories>()
      const categoryMap = new Map<string, CategoryWithWebsites>()

      // 3. 初始化目录映射
      directories.forEach(dir => {
        directoryMap.set(dir.id, {
          ...dir,
          categories: [],
        })
      })

      // 4. 处理分类并关联到目录
      categories.forEach(cat => {
        const directory = directoryMap.get(cat.directoryId)
        if (directory) {
          const categoryWithWebsites: CategoryWithWebsites = {
            ...cat,
            websites: [],
          }
          directory.categories.push(categoryWithWebsites)
          categoryMap.set(cat.id, categoryWithWebsites)
        }
      })

      // 5. 处理网站并关联到分类
      websites.forEach(website => {
        const category = categoryMap.get(website.categoryId)
        if (category) {
          category.websites.push(website)
        }
      })

      // 6. 排序处理
      const result = Array.from(directoryMap.values())
        .sort((a, b) => a?.order - b.order) // 目录按order排序
        .map(dir => ({
          ...dir,
          categories: dir.categories
            .sort((a, b) => a.order - b.order) // 分类按order排序
            .map(cat => ({
              ...cat,
              websites: cat.websites.sort((a, b) => {
                // 置顶的网站排在前面
                if (a.isPinned !== b.isPinned) {
                  return a.isPinned ? -1 : 1
                }
                // 然后按order排序
                return a.order - b.order
              }),
            })),
        }))

      return result
    }, '获取完整网站结构')
  },

  /**
   * 获取扁平化的网站列表（包含目录和分类信息）
   * 适用于搜索、筛选等场景
   */
  async getFlatWebsites(): Promise<
    Array<
      Website & {
        directoryName: string
        categoryName: string
        directoryKey: string
      }
    >
  > {
    return handleError(async () => {
      const [directories, categories, websites] = await Promise.all([
        db.directories.toArray(),
        db.categories.toArray(),
        db.websites.toArray(),
      ])

      // 创建快速查找映射
      const directoryMap = new Map(directories.map(dir => [dir.id, dir]))
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

      return websites.map(website => {
        const category = categoryMap.get(website.categoryId)
        const directory = directoryMap.get(website.directoryId)

        return {
          ...website,
          directoryName: directory?.name || '未知目录',
          categoryName: category?.name || '未知分类',
          directoryKey: directory?.key || '',
        }
      })
    }, '获取扁平化网站列表')
  },

  /**
   * 按目录ID获取特定目录的完整结构
   */
  async getStructureByDirectory(directoryId: string): Promise<DirectoryWithCategories | null> {
    return handleError(async () => {
      const directory = await db.directories.get(directoryId)
      if (!directory) return null

      const [categories, websites] = await Promise.all([
        db.categories.where('directoryId').equals(directoryId).toArray(),
        db.websites.where('directoryId').equals(directoryId).toArray(),
      ])

      const categoryMap = new Map<string, CategoryWithWebsites>()

      const categoriesWithWebsites = categories
        .sort((a, b) => a.order - b.order)
        .map(cat => {
          const catWithWebsites: CategoryWithWebsites = {
            ...cat,
            websites: [],
          }
          categoryMap.set(cat.id, catWithWebsites)
          return catWithWebsites
        })

      websites.forEach(website => {
        const category = categoryMap.get(website.categoryId)
        if (category) {
          category.websites.push(website)
        }
      })

      // 对每个分类内的网站进行排序
      categoriesWithWebsites.forEach(cat => {
        cat.websites.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1
          }
          return a.order - b.order
        })
      })

      return {
        ...directory,
        categories: categoriesWithWebsites,
      }
    }, '获取指定目录结构')
  },

  // 同步所有数据到本地数据库
  async syncAllDataToLocalDB(directories: Directory[], categories: Category[], websites: Website[]) {
    return handleError(async () => {
      // 'rw' 表示读写权限，后面跟上涉及的所有表
      await db.transaction('rw', db.directories, db.categories, db.websites, async () => {
        // 在事务内部执行批量操作
        await db.directories.bulkPut(directories)
        await db.categories.bulkPut(categories)
        await db.websites.bulkPut(websites)
        // 如果这里发生错误，上面两个操作都会回滚
      })
    }, '同步远程数据到本地')
  },
}
