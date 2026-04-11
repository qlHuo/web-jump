<template>
  <div class="h-full bg-linear-to-bl">
    <PageHeader />
    <div class="container h-[calc(100%-200px)] flex m-auto mt-4">
      <RenderMenu @click="handleClickMenuItem" />
      <div class="flex-1 m-4 mt-0">
        <WebsiteCardList v-for="item in fullData" :key="item.key" :data="item" :id="item.key" class="scroll-mt-19" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useWebsiteApi } from '@/composable/api'
import type { Directory, FullWebsiteStructure } from '@/db/models'
import PageHeader from './header/index.vue'
import RenderMenu from './components/RenderMenu.vue'
import WebsiteCardList from './components/WebsiteCardList.vue'

const fullData = ref<FullWebsiteStructure>([])
const getFullData = async () => {
  useWebsiteApi()
    .getFullWebsitesStructure()
    .then(res => {
      console.log('FullWebsiteStructure', res)
      fullData.value = res || []
    })
}

onMounted(() => {
  getFullData()
})

// 菜单点击事件处理函数
const handleClickMenuItem = (item: Directory) => {
  // 获取目标元素id（从按钮href属性提取，如href="#target"）
  const targetId = item.key
  // 找到目标元素
  const targetElement = document.getElementById(targetId)
  // 平滑滚动到目标位置
  targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style></style>
