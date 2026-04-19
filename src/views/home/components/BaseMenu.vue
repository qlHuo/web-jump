<template>
  <div v-if="props.directoryList.length" class="h-full w-32 p-4" v-bind="$attrs">
    <div
      v-for="item in props.directoryList"
      :key="item.id"
      class="flex items-center cursor-pointer text-[var(--td-text-color-primary)] hover:bg-white hover:text-[var(--td-brand-color)] p-2 rounded mb-1 text-sm"
      @click="handleDirectoryClick(item)"
    >
      <span class="truncate ml-2">{{ item.name }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Directory } from '@/db/models'
const props = defineProps<{ directoryList: Directory[] }>()
const emit = defineEmits(['click'])

const handleDirectoryClick = (item: Directory) => {
  emit('click', item)
}
</script>

<style scoped lang="less"></style>
