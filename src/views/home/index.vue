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

<script lang="tsx" setup>
import { onMounted, ref } from 'vue'
import { useDirectoryApi, useGlobalApi, useWebsiteApi, useWorkerApi } from '@/composable/api'
import type { Directory, FullWebsiteStructure } from '@/db/models'
import PageHeader from './header/index.vue'
import RenderMenu from './components/RenderMenu.vue'
import WebsiteCardList from './components/WebsiteCardList.vue'
import NotificationPlugin from 'tdesign-vue-next/es/notification/plugin'
import type { NotificationInstance } from 'tdesign-vue-next'

const fullData = ref<FullWebsiteStructure>([])
const directoryList = ref<Directory[]>([])
const loading = ref<boolean>(false)
const notification = ref<Promise<NotificationInstance>>()

const handleOpenNotification = () => {
  if (notification.value) return false
  notification.value = NotificationPlugin.info({
    title: '检测到数据有更新，是否同步远程数据？',
    content: '此操作将增量更新本地网站，不会删除您本地的数据，请确认是否更新！',
    placement: 'bottom-right',
    duration: 0,
    footer: () => {
      return (
        <div class="flex justify-end">
          <t-button theme="default" variant="text" onClick={handleCloseNotification}>
            取消
          </t-button>
          <t-button theme="primary" variant="text" onClick={() => handleSyncLocalData('notice')}>
            更新
          </t-button>
        </div>
      )
    },
  })
}

// 关闭notice弹窗
const handleCloseNotification = async () => {
  const notificationInstance = (await notification.value) as NotificationInstance
  notificationInstance?.close()
}

// 同步远程数据到本地
const handleSyncLocalData = async (type?: string) => {
  if (type === 'notice') {
    await handleCloseNotification()
  }
  await handleSyncLogic()
  await getDirectoryList()
  await getFullData()
}

// 同步远程数据到本地
const syncRemoteDataToLocalDB = async () => {
  try {
    // 检查相关表是否有数据
    const hasTableData = await useGlobalApi().getTablesHasData(['directories', 'categories', 'websites'])
    console.log('hasTableData:', hasTableData)

    // 安全获取本地版本号
    let localVersion: string | null = null
    try {
      const storedVersion = localStorage.getItem('currentVersion')
      if (storedVersion) {
        const parsed = JSON.parse(storedVersion)
        localVersion = parsed.version ?? null
      }
    } catch (error) {
      console.warn('解析本地版本号失败:', error)
      localVersion = null
    }

    // 获取远程最新版本信息
    const { success, data, message } = await useWorkerApi().getRemoteLatestVersion()
    if (!success) {
      console.error('获取远程最新版本失败:', message)
      return
    }

    const remoteVersion = data.version
    // 判断是否需要同步
    const isVersionMatch = localVersion && remoteVersion === localVersion
    console.log('isVersionMatch && hasTableData', isVersionMatch, hasTableData, isVersionMatch && hasTableData)
    // 版本一致或本地已有数据，无需同步
    if (isVersionMatch && hasTableData) return

    // 本地无数据，直接同步
    if (!hasTableData) {
      await handleSyncLocalData()
      return
    }

    // 本地有数据且版本不一致，提示用户是否同步
    handleOpenNotification()
  } catch (error) {
    console.error('同步远程数据到本地数据库过程中发生错误:', error)
  }
}

// 同步数据的逻辑
const handleSyncLogic = async () => {
  const { data, success, message } = await useWorkerApi().getRemoteWebsiteData()
  if (success) {
    const { directory, categories, websites, versions } = data
    // 更新版本号并同步数据到本地数据库
    localStorage.setItem('currentVersion', JSON.stringify(versions?.[0]))
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
      fullData.value = res || []
    })
}

onMounted(async () => {
  await getDirectoryList()
  await getFullData()
  await syncRemoteDataToLocalDB()
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
