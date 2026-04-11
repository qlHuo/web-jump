<template>
  <IconFont :name="name" :size="size" :style="style" url="//at.alicdn.com/t/c/font_5154341_aeyke8er3.css" />
</template>

<script lang="ts" setup>
import { IconFont } from 'tdesign-icons-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: string | number
  color?: string
}>()

const name = computed(() => {
  return `iconfont ${props.name}`
})

const size = computed((): string => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }
  return props.size || '16px'
})

const style = computed(() => {
  return {
    color: props.color,
  }
})
</script>

<style scoped lang="less"></style>
