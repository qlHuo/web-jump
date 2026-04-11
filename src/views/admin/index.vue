<template>
  <div class="h-screen">
    <t-layout class="h-full">
      <t-header class="flex items-center pl-6 pr-6 border-b border-gray-200">
        <div class="font-semibold text-lg">网站设置</div>
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
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AsideDirectory from './AsideDirectory.vue'
import Content from './Content.vue'
import type { Directory } from '@/db/models'
const directoryId = ref<string>('')

const handleClickItem = (item: Directory) => {
  directoryId.value = item.id
}
</script>

<style scoped lang="less"></style>
