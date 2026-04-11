// types/models.ts
/** 基础时间戳接口 */
export interface Timestamps {
  createdAt?: Date
  updatedAt?: Date
}

/** 目录模型 - 顶层容器 */
export interface Directory extends Timestamps {
  id: string // 必填，由 crypto.randomUUID() 生成
  name: string // 目录显示名称
  order: number // 全局排序序号（用于目录间排序）
  key: string // 目录值（英文目录名称，用于URL）
}

/** 分类模型 - 目录下的分类 */
export interface Category extends Timestamps {
  id: string // 必填
  name: string // 分类名称
  directoryId: string // 关联的目录ID（外键）
  order: number // 在目录内的排序序号
}

/** 网站模型 - 最终的数据项 */
export interface Website extends Timestamps {
  id: string // 必填
  name: string // 网站名称
  url: string // 网站URL（必须是有效URL）
  icon?: string // 网站图标（base64 或 CDN URL）
  description?: string // 网站描述
  categoryId: string // 所属分类ID（外键）
  directoryId: string // 所属目录ID（外键，冗余字段提升查询性能）
  order: number // 在分类内的排序序号
  tags?: string[] // 标签数组
  isPinned: boolean // 是否置顶（默认false）
}

/** 分类 + 网站列表 */
export interface CategoryWithWebsites extends Category {
  websites: Website[]
}

/** 目录 + 分类列表 */
export interface DirectoryWithCategories extends Directory {
  categories: CategoryWithWebsites[]
}

/** 完整的三层结构 */
export type FullWebsiteStructure = DirectoryWithCategories[]
