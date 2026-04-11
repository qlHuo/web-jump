// db/index.ts
import Dexie from 'dexie'
import type { Directory, Category, Website } from '@/db/models'

class WebJumpDB extends Dexie {
  directories!: Dexie.Table<Directory, string>
  categories!: Dexie.Table<Category, string>
  websites!: Dexie.Table<Website, string>

  constructor() {
    super('WebJumpDB')

    // 定义数据库结构的版本
    this.version(1).stores({
      directories: '&id, name, order, key, createdAt, updatedAt',
      categories: '&id, name, directoryId, order, createdAt, updatedAt, [directoryId+order]',
      websites: `
        &id,
        name,
        url,
        categoryId,
        directoryId,
        order,
        createdAt,
        updatedAt,
        isPinned,
        tags,
        [categoryId+order],
        [directoryId+order],
        [categoryId+isPinned+order],
        [lastVisitedAt]
      `,
    })
  }
}

const db = new WebJumpDB()
export default db
