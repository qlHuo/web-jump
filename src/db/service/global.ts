import db from '@/db'
import { handleError } from '@/db/utils/handleError'

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
}
