import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import websiteService from '@/db/service/website'
import type { Website, FullWebsiteStructure } from '@/db/models'

// stores/website.ts → 只管「数据缓存」和「原子操作」
export const useWebsiteStore = defineStore('website', () => {
  const flatList = ref<
    Array<
      Website & {
        directoryName: string
        categoryName: string
        directoryKey: string
      }
    >
  >([])
  const fullStructure = ref<FullWebsiteStructure>([])

  // 纯数据方法，不包含业务逻辑
  async function setFlatList() {
    flatList.value = await websiteService.getFlatWebsites()
  }
  async function setFullStructure() {
    fullStructure.value = await websiteService.getFullWebsitesStructure()
  }

  return { flatList, fullStructure, setFlatList, setFullStructure }
})
