import type { Directory } from '@/db/models'
import directoryService from '@/db/service/directory'

export function useDirectoryApi() {
  // 创建目录
  async function createDirectory(data: Omit<Directory, 'id' | 'order'>) {
    return await directoryService.create(data)
  }

  // 更新目录
  async function updateDirectory(id: string, data: Omit<Directory, 'id' | 'order'>) {
    return await directoryService.update(id, data)
  }

  // 删除目录
  async function deleteDirectory(id: string) {
    return await directoryService.delete(id)
  }

  // 获取所有目录
  async function getDirectoryList(data: object) {
    const directories = await directoryService.getDirectoryList(data)
    return directories
  }

  return {
    createDirectory,
    updateDirectory,
    deleteDirectory,
    getDirectoryList,
  }
}
