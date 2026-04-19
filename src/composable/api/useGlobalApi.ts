import global from '@/db/service/global'
import type { Directory, Category, Website } from '@/db/models'

export function useGlobalApi() {
  // 检查指定表是否有数据
  function getTablesHasData(tables: string[]) {
    return global.getTablesHasData(tables)
  }

  async function exportWebsiteData() {
    return global.exportWebsiteData()
  }

  // 导入网站数据到本地数据库
  async function importWebsiteData(directories: Directory[], categories: Category[], websites: Website[]) {
    await global.importWebsiteData(directories, categories, websites)
  }

  return {
    getTablesHasData,
    exportWebsiteData,
    importWebsiteData,
  }
}
