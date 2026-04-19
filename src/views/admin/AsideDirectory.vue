<template>
  <div class="w-full h-full relative p-4 border-r border-gray-200">
    <div class="w-full flex items-center justify-between mb-4">
      <t-input
        placeholder="请输入名称搜索"
        v-model="searchValue"
        @enter="getDirectoryList"
        @blur="getDirectoryList"
      ></t-input>
      <t-button class="!ml-2" @click="handleOpenDirectoryConfigDialog('create')">添加</t-button>
    </div>
    <t-list class="h-[calc(100%-48px)]" v-if="directoryList.length" size="small">
      <t-list-item
        v-for="item in directoryList"
        :key="item.id"
        class="cursor-pointer text-[var(--td-text-color-primary)] hover:bg-[var(--td-brand-color-1)] hover:text-[var(--td-brand-color)] p-2 rounded mb-1 text-sm"
        :class="selectDirectory?.id === item.id ? '!bg-[var(--td-brand-color-1)] !text-[var(--td-brand-color)]' : ''"
        @click="handleClickItem(item)"
      >
        <HiEllipsis class="!pr-1" style="width: 100%" :content="item.name"></HiEllipsis>
        <template #action>
          <t-dropdown :options="operateOpts" @click="handleOperateClick($event, item)">
            <t-icon name="ellipsis" size="16" class="cursor-pointer" />
          </t-dropdown>
        </template>
      </t-list-item>
    </t-list>
    <t-empty v-else class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"> </t-empty>
    <DirectoryConfigDialog ref="directoryConfigDialogRef" @refresh="getDirectoryList" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Directory } from '@/db/models'
import { DialogPlugin, MessagePlugin, type DropdownItemProps } from 'tdesign-vue-next'
import { useDirectoryApi } from '@/composable/api/useDirectoryApi'
import DirectoryConfigDialog from './DirectoryConfigDialog.vue'
const emit = defineEmits(['click'])

const searchValue = ref<string>('')
const directoryList = ref<Directory[]>([])
const operateOpts = ref<Array<DropdownItemProps>>([
  {
    content: '编辑',
    value: 'edit',
  },
  {
    content: '删除',
    value: 'delete',
    theme: 'error',
  },
])
const selectDirectory = ref<Directory>()
const directoryConfigDialogRef = ref()

// 获取目录列表
const getDirectoryList = () => {
  useDirectoryApi()
    .getDirectoryList({ name: searchValue.value })
    .then(res => {
      directoryList.value = res
      if (!selectDirectory.value) {
        selectDirectory.value = res[0]
        emit('click', selectDirectory.value)
      }
    })
}

onMounted(() => {
  getDirectoryList()
})

const handleClickItem = (item: Directory) => {
  selectDirectory.value = item
  emit('click', item)
}

const handleOperateClick = (context: DropdownItemProps, item: Directory) => {
  if (context.value === 'edit') {
    handleOpenDirectoryConfigDialog('edit', item)
  } else if (context.value === 'delete') {
    handleDeleteDirectory(item)
  }
}

const handleOpenDirectoryConfigDialog = (type: 'create' | 'edit', item?: Directory) => {
  directoryConfigDialogRef.value.handleOpen(type, item)
}

const handleDeleteDirectory = (item: Directory) => {
  const dialog = DialogPlugin.confirm({
    header: '确认删除目录?',
    body: '此操作将同步删除该目录下的分类和网站且不可恢复，请谨慎操作!',
    theme: 'warning',
    onConfirm: () => {
      useDirectoryApi()
        .deleteDirectory(item.id)
        .then(() => {
          getDirectoryList()
          dialog.destroy()
        })
        .catch(err => {
          MessagePlugin.error(err || '删除失败')
        })
    },
    onClose: () => {
      dialog.destroy()
    },
  })
}
</script>
