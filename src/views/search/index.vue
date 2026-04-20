<template>
  <div class="h-dvh w-full">
    <Header class="fixed top-0 left-0 z-9" />

    <div class="pt-20 pl-4 pr-4 pb-4">
      <SearchInput class="mb-4" @search="handleSearch" />
      <div
        v-if="websiteList.length"
        class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 bg-white p-4 rounded-xl"
      >
        <div
          v-for="item in websiteList"
          :key="item.id"
          class="group w-full h-full rounded-md cursor-pointer p-2 border border-gray-200 hover:shadow-md"
          @click="handleWebsiteClick(item)"
        >
          <div class="h-8 flex items-center mb-2 text-sm group-hover:text-[var(--td-brand-color)]">
            <t-image class="w-6 h-6 rounded-sm object-cover mr-2 !bg-transparent" :src="item.icon" shape="circle">
              <template #error>
                <HiIcon name="icon-24gl-network" size="24px" />
              </template>
            </t-image>
            <HiEllipsis class="flex-1 group-hover:underline group-hover:font-bold" :content="item.name" />
          </div>
          <div class="h-8 text-xs text-gray-500">
            <HiEllipsis :content="item.description" :line-clamp="2" :tooltipAttrs="{ placement: 'bottom' }" />
          </div>
        </div>
      </div>
      <t-empty v-else class="!mt-20"></t-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { FullWebsiteStructure, Website } from '@/db/models'
import { useWebsiteApi } from '@/composable/api'
import Header from '@/components/header/index.vue'
import SearchInput from '@/views/home/header/components/SearchInput.vue'
import { useRoute } from 'vue-router'

const websiteList = ref<Website[]>([])

const handleSearch = (value: string) => {
  getFullData(value)
}

const searchValue = computed(() => {
  return useRoute().query?.q || ''
})

// 获取完整数据
const getFullData = async (value: string) => {
  if (!value) return (websiteList.value = [])
  useWebsiteApi()
    .getAll(value)
    .then(res => {
      websiteList.value = res
    })
}

const handleWebsiteClick = (item: { url: string }) => {
  window.open(item.url, '_blank')
}

onMounted(() => {
  getFullData(searchValue.value as string)
})
</script>

<style scoped lang="less"></style>
