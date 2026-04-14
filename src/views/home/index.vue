<template>
  <div class="h-full bg-linear-to-bl">
    <PageHeader />
    <div class="container h-[calc(100%-200px)] flex m-auto mt-4">
      <t-loading fullscreen :loading="loading"></t-loading>
      <RenderMenu :directoryList="directoryList" @click="handleClickMenuItem" />
      <div class="flex-1 m-4 mt-0">
        <WebsiteCardList v-for="item in fullData" :key="item.key" :data="item" :id="item.key" class="scroll-mt-19" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, version } from 'vue'
import { useDirectoryApi, useWebsiteApi, useWorkerApi } from '@/composable/api'
import type { Directory, FullWebsiteStructure } from '@/db/models'
import PageHeader from './header/index.vue'
import RenderMenu from './components/RenderMenu.vue'
import WebsiteCardList from './components/WebsiteCardList.vue'

const fullData = ref<FullWebsiteStructure>([])
const directoryList = ref<Directory[]>([])
const loading = ref<boolean>(false)

// 同步远程数据到本地
const syncRemoteDataToLocalDB = async () => {
  const { version: localVersion } = localStorage.getItem('currentVesion')
    ? JSON.parse(localStorage.getItem('currentVesion')!)
    : {}
  const { success, data, message } = await useWorkerApi().getRemoteLatestVersion()
  if (success) {
    const remoteVersion = data.version
    if (localVersion && remoteVersion === localVersion) {
      console.log('数据已是最新版本，无需更新')
      return
    }
    await handleSyncLogic()
  } else {
    console.error('getRemoteLatestVersion error', message)
  }
}

// 同步数据的逻辑
const handleSyncLogic = async () => {
  const { data, success, message } = await useWorkerApi().getRemoteWebsiteData()
  if (success) {
    const { directory, categories, websites, versions } = data
    // 更新版本号并同步数据到本地数据库
    localStorage.setItem('currentVesion', JSON.stringify(versions?.[0]))
    await useWebsiteApi().syncAllDataToLocalDB(directory, categories, websites)
  } else {
    console.error('getRemoteWebsitesData error', message)
  }
}

// 获取目录列表
const getDirectoryList = () => {
  useDirectoryApi()
    .getDirectoryList({})
    .then(res => {
      directoryList.value = res || []
    })
}

// 获取完整数据
const getFullData = async () => {
  useWebsiteApi()
    .getFullWebsitesStructure()
    .then(res => {
      console.log('getFullWebsitesStructure res', res)
      fullData.value = res || []
    })
}

onMounted(async () => {
  loading.value = true
  await syncRemoteDataToLocalDB()
  await getDirectoryList()
  await getFullData()
  loading.value = false
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
