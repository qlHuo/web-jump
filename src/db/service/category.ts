import db from '@/db'
import type { Category, CategoryWithWebsites } from '@/db/models'
import { handleError } from '@/db/utils/handleError'
import { uuid } from '@/utils/index'

// 获取下一个 order 值
const getNextOrder = async (): Promise<number> => {
  const lastCategory = await db.categories.orderBy('order').last()
  return lastCategory ? lastCategory.order + 1 : 0
}

export default {
  // 创建分类
  create: async (
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'order'> & {
      order?: number
    }
  ): Promise<string> => {
    return handleError(async () => {
      const id = uuid()
      const now = new Date()
      const order = category.order ?? (await getNextOrder())

      await db.categories.add({
        ...category,
        id,
        createdAt: now,
        updatedAt: now,
        order,
      })
      return id
    }, '创建分类')
  },

  // 根据目录ID查询分类列表
  getCategoriesById: async (directoryId: string) => {
    return handleError(async () => {
      return await db.categories.filter(w => w.directoryId === directoryId).sortBy('order')
    })
  },

  // 查询单个分类详情
  getById: async (id: string): Promise<Category | undefined> => {
    return handleError(async () => {
      return await db.categories.get(id)
    }, '获取分类详情')
  },

  // 更新分类
  update: async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
    return handleError(async () => {
      await db.categories.update(id, {
        ...data,
        updatedAt: new Date(),
      })
    }, '更新分类')
  },

  // 删除分类（级联删除网站）
  delete: async (id: string): Promise<void> => {
    return handleError(async () => {
      await db.transaction('rw', [db.categories, db.websites], async () => {
        await db.categories.delete(id)
        await db.websites.where('categoryId').equals(id).delete()
      })
    }, '删除分类')
  },

  /**
   * 按目录ID获取特定目录下的所有分类及网站数据
   */
  async getCategoriesWebsitesByDirectory(directoryId: string): Promise<CategoryWithWebsites[] | []> {
    return handleError(async () => {
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

      return categoriesWithWebsites
    }, '根据目录id获取分类和网站数据')
  },
}
