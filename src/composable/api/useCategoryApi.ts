import type { Category } from '@/db/models'
import categoryService from '@/db/service/category'

export function useCategoryApi() {
  // 创建目录
  async function createCategory(data: Omit<Category, 'id' | 'order'>) {
    const id = await categoryService.create(data)
    return id
  }

  // 更新目录
  async function updateCategory(id: string, data: Partial<Category>) {
    await categoryService.update(id, data)
    return id
  }

  // 批量删除
  async function deleteCategory(id: string) {
    await categoryService.delete(id)
    return id
  }

  // 根据目录id获取分类
  async function getAllCategoriesById(directoryId: string) {
    const categories = await categoryService.getCategoriesById(directoryId)
    return categories
  }

  async function getCategoriesWebsitesByDirectory(directoryId: string) {
    const categories = await categoryService.getCategoriesWebsitesByDirectory(directoryId)
    return categories
  }

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesById,
    getCategoriesWebsitesByDirectory,
  }
}
