import type { Category, Directory, Website } from '@/db/models'
import websiteService from '@/db/service/website'

export function useWebsiteApi() {
  // 创建网站
  async function createWebsite(
    data: Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'order'> & {
      order?: number
    }
  ) {
    const cleanData = JSON.parse(JSON.stringify(data))
    const id = await websiteService.create(cleanData)
    return id
  }

  // 更新网站
  async function updateWebsite(id: string, data: Omit<Website, 'id' | 'createdAt' | 'updatedAt' | 'order'>) {
    const cleanData = JSON.parse(JSON.stringify(data))
    await websiteService.update(id, cleanData)
  }

  // 删除网站
  async function deleteWebsite(id: string) {
    await websiteService.delete(id)
  }

  // 批量删除网站
  async function batchDeleteWebsite(ids: string[]) {
    await websiteService.batchDelete(ids)
  }

  // 获取所有网站列表
  async function getAllWebsites() {
    const websites = await websiteService.getAll()
    return websites
  }

  // 根据分类id获取网站列表
  async function getWebsitesByCategoryId(categoryId: string) {
    const websites = await websiteService.getByCategoryId(categoryId)
    return websites
  }

  // 根据分类id获取网站列表
  async function getFullWebsitesStructure() {
    const data = await websiteService.getFullWebsitesStructure()
    return data
  }

  async function getAll() {
    const data = await websiteService.getAll()
    return data
  }

  // 同步所有数据到本地数据库
  async function syncAllDataToLocalDB(directories: Directory[], categories: Category[], websites: Website[]) {
    await websiteService.syncAllDataToLocalDB(directories, categories, websites)
  }

  return {
    createWebsite,
    updateWebsite,
    deleteWebsite,
    batchDeleteWebsite,
    getAllWebsites,
    getWebsitesByCategoryId,
    getFullWebsitesStructure,
    getAll,
    syncAllDataToLocalDB,
  }
}
