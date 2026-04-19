<template>
  <div class="h-screen">
    <t-layout class="h-full">
      <t-header class="flex items-center justify-between pl-6 pr-6 border-b border-gray-200">
        <div class="font-semibold text-lg">网站设置</div>
        <t-dropdown :options="moreOpts">
          <t-button>更多操作</t-button>
        </t-dropdown>
      </t-header>
      <t-layout class="w-full">
        <t-aside width="280px">
          <AsideDirectory @click="handleClickItem" />
        </t-aside>
        <t-content class="w-[calc(100%-280px)]">
          <Content :directoryId="directoryId" />
        </t-content>
      </t-layout>
    </t-layout>
    <PushRemoteDialog ref="pushRemoteDialogRef" />
    <ImportDialog ref="importDialogRef" @refresh="handleRefresh" />
  </div>
</template>

<script lang="tsx" setup>
import { ref } from 'vue'
import { useGlobalApi, useWorkerApi } from '@/composable/api'
import { MessagePlugin, type DropdownItemProps } from 'tdesign-vue-next'
import type { Directory } from '@/db/models'
import AsideDirectory from './AsideDirectory.vue'
import Content from './Content.vue'
import PushRemoteDialog from './PushRemoteDialog.vue'
import ImportDialog from './ImportDialog.vue'

const directoryId = ref<string>('')
const pushRemoteDialogRef = ref()
const importDialogRef = ref()

const moreOpts = ref<DropdownItemProps[]>([
  {
    prefixIcon: () => <hi-icon name="icon-daochu" size="14px" />,
    content: '导出数据',
    value: 'export',
    onClick: () => {
      handleExportData()
    },
  },
  {
    prefixIcon: () => <hi-icon name="icon-daoru" size="14px" />,
    content: '导入数据',
    value: 'import',
    onClick: () => {
      handleImportData()
    },
  },
  {
    prefixIcon: () => <hi-icon name="icon-tongbu" size="14px" />,
    content: '同步数据',
    value: 'sync',
    onClick: () => {
      handleSyncData()
    },
  },
  {
    prefixIcon: () => <hi-icon name="icon-tuisong" size="14px" />,
    content: '推送数据',
    value: 'sync',
    onClick: () => {
      handleOpenPushRemoteDialog()
    },
  },
])

const handleClickItem = (item: Directory) => {
  directoryId.value = item.id
}

// 导出数据
const handleExportData = () => {
  useGlobalApi()
    .exportWebsiteData()
    .then(() => {
      MessagePlugin.success('导出成功')
    })
}

// 导入数据
const handleImportData = () => {
  importDialogRef.value.handleOpen()
}

// // 同步远程数据
const handleSyncData = async () => {
  try {
    const { data, success, message } = await useWorkerApi().getRemoteWebsiteData()
    if (success) {
      const { directory, categories, websites, versions } = data
      // 更新版本号并同步数据到本地数据库
      localStorage.setItem('currentVersion', JSON.stringify(versions?.[0]))
      await useGlobalApi().importWebsiteData(directory, categories, websites)
      location.reload()
    } else {
      console.error('getRemoteWebsitesData error', message)
    }
  } catch (error) {
    console.error('同步远程数据到本地数据库过程中发生错误:', error)
  }
}

// 推送数据到远程
const handleOpenPushRemoteDialog = () => {
  pushRemoteDialogRef.value?.handleOpen()
}

const handleRefresh = () => {
  location.reload()
}
</script>
