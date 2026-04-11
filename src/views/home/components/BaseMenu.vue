<template>
  <div class="h-full w-32 p-4" v-bind="$attrs">
    <div
      v-for="item in directoryList"
      :key="item.id"
      class="flex items-center cursor-pointer text-[var(--td-text-color-primary)] hover:bg-white hover:text-[var(--td-brand-color-7)] p-2 rounded mb-1 text-sm"
      @click="handleDirectoryClick(item)"
    >
      <span class="truncate ml-2">{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Directory } from '@/db/models'
import { useDirectoryApi } from '@/composable/api'

const emit = defineEmits(['click'])
const directoryList = ref<Directory[]>([])

const handleDirectoryClick = (item: Directory) => {
  emit('click', item)
}

const getDirectoryList = () => {
  useDirectoryApi()
    .getDirectoryList({})
    .then(res => {
      directoryList.value = res || []
    })
}

onMounted(() => {
  getDirectoryList()
})
</script>

<style scoped lang="less"></style>
