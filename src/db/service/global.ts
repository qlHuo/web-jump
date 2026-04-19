import db from '@/db'
import { handleError } from '@/db/utils/handleError'
import type { Directory, Category, Website } from '@/db/models'

export default {
  // 检查所有表是否都有数据
  hasAnyData(): Promise<boolean> {
    return handleError(async () => {
      const tableNames = db.tables.map(table => table.name)

      for (const tableName of tableNames) {
        const count = await db.table(tableName).count()
        if (count > 0) {
          return true // 只要有任意一个表有数据就返回true
        }
      }
      return false
    }, '检查所有表是否都有数据')
  },

  // 检查指定表是否都有数据
  getTablesHasData(tables: string[]): Promise<boolean> {
    return handleError(async () => {
      const results = await Promise.all(
        tables.map(async table => {
          const count = await db.table(table).count()
          return count > 0
        })
      )
      return results.every(hasData => hasData) // 所有表都有数据才返回true
    })
  },

  // 导出网站数据
  exportWebsiteData() {
    return handleError(async () => {
      // 1. 查询所有数据
      const directories = await db.directories.toArray()
      const categories = await db.categories.toArray()
      const websites = await db.websites.toArray()
      const data = {
        directories: directories,
        categories: categories,
        websites: websites,
      }

      // 2. 将数据转为 JSON 字符串并创建一个blob对象
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })

      // 3. 创建一个临时的 <a> 标签来触发下载
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'export_website_data.json' // 设置下载的文件名
      document.body.appendChild(a)
      a.click() // 模拟点击

      // 4. 清理资源
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, '导出网站数据')
  },

  // 同步所有数据到本地数据库
  async importWebsiteData(directories: Directory[], categories: Category[], websites: Website[]) {
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
