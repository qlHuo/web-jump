<template>
  <div class="w-full p-4 rounded-xl bg-white mb-4">
    <div class="flex mb-4 border-b pb-2 border-gray-200">
      <HiTitle :content="props.data.name" />
      <div class="flex-1 flex min-w-0 text-xs ml-2 mr-2">
        <div
          class="inline-flex items-center max-w-full whitespace-nowrap overflow-y-hidden overflow-x-auto"
          style="scrollbar-width: none"
          @wheel="handleWheelCategory"
        >
          <div
            class="cursor-pointer ml-0.5 mr-0.5 pr-1 pl-1"
            :class="currentTab === item.id ? 'bg-[var(--td-brand-color)] text-white rounded-xl' : ''"
            v-for="item in props.data.categories"
            :key="item.id"
            @click="handleTabChange(item.id)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="websiteList.length" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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
    <t-empty v-else></t-empty>
  </div>
</template>

<script lang="ts" setup>
import type { Website, DirectoryWithCategories } from '@/db/models'
import { ref, watch } from 'vue'
const props = defineProps<{ data: DirectoryWithCategories }>()

const currentTab = ref<string>('')
const websiteList = ref<Website[]>([])

watch(
  () => props.data.categories,
  categories => {
    currentTab.value = categories[0]?.id || ''
    websiteList.value = categories[0]?.websites || []
  },
  {
    immediate: true,
  }
)

const handleWheelCategory = (e: WheelEvent) => {
  // 阻止浏览器的默认滚动行为
  e.preventDefault()

  // 手动控制横向滚动
  const container = e.currentTarget as HTMLElement
  if (container) {
    // deltaY 是纵向滚动的距离，我们把它转换为横向滚动
    container.scrollLeft += e.deltaY
  }
}

const handleTabChange = (value: string) => {
  currentTab.value = value
  const category = props.data.categories.find(item => item.id === value)
  websiteList.value = category?.websites || []
}
const handleWebsiteClick = (item: { url: string }) => {
  window.open(item.url, '_blank')
}
</script>
