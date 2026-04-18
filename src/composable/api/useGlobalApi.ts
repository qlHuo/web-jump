import global from '@/db/service/global'

export function useGlobalApi() {
  // 检查指定表是否有数据
  function getTablesHasData(tables: string[]) {
    return global.getTablesHasData(tables)
  }
  return {
    getTablesHasData,
  }
}
