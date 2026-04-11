<template>
  <div :class="titleClass" v-bind="$attrs">
    <div class="hi-title__header">
      <!-- 前缀区域：插槽 > 自定义 icon 组件 > 默认装饰条 -->
      <div class="hi-title__prefix">
        <slot name="prefix">
          <component
            v-if="prefixIcon"
            :is="prefixIcon"
            :class="['hi-title__icon', iconClass]"
            :style="{ fontSize: iconSize }"
          />
          <div
            v-else
            :class="['hi-title__bar', barClass]"
            :style="{ height: barHeight }"
          />
        </slot>
      </div>
      <div
        v-if="content || !!slots.default"
        :class="['hi-title__text', textClass]"
        :style="{
          color: textColor,
          fontSize: textSize,
        }"
      >
        <slot>{{ content }}</slot>
      </div>
    </div>
    <p v-if="hasDescription" :class="['hi-title__description', descClass]">
      <slot name="description">{{ description }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Component } from 'vue'

// 尺寸映射
const TITLE_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
} as const

// Props 定义
interface HiTitleProps {
  iconClass?: string
  content?: string
  description?: string
  size?: keyof typeof TITLE_SIZE_MAP
  color?: string
  prefixIcon?: Component
  barClass?: string
  textClass?: string
  descClass?: string
}

const props = withDefaults(defineProps<HiTitleProps>(), {
  iconClass: '',
  content: '',
  description: '',
  size: 'medium',
  color: '',
  prefixIcon: undefined,
  barClass: '',
  textClass: '',
  descClass: '',
})

// Slots
const slots = useSlots()

// 计算属性
const titleClass = computed(() => [
  'hi-title',
  `hi-title--${props.size}`,
  { 'hi-title--has-desc': hasDescription.value },
])

const textSize = computed(
  () => TITLE_SIZE_MAP[props.size] || TITLE_SIZE_MAP.medium
)

const iconSize = computed(() => textSize.value)

const barHeight = computed(() => {
  const base = parseFloat(TITLE_SIZE_MAP[props.size] || '16')
  return `${base * 1.2}px`
})

const textColor = computed(() => props.color || 'inherit')

const hasDescription = computed(() => {
  return !!props.description || !!slots.description
})
</script>

<style lang="less" scoped>
@import './index.less';
</style>
