<template>
  <t-tooltip :content="content" v-bind="tooltipAttrs" :disabled="disabled">
    <div :class="contentClass" :style="{ '--line-clamp': lineClamp }" @mouseenter="handleMouseEnter">
      <slot>{{ content }}</slot>
    </div>
  </t-tooltip>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TooltipProps } from 'tdesign-vue-next'

const props = withDefaults(
  defineProps<{
    content: string
    lineClamp?: number
    tooltipAttrs?: Omit<TooltipProps, 'content' | 'disabled'>
  }>(),
  {
    lineClamp: 1,
    tooltipAttrs: () => ({}),
  }
)

const tooltipAttrs = computed(() => ({
  ...props.tooltipAttrs,
  destroyOnClose: true,
  overlayInnerStyle: {
    maxWidth: '300px',
  },
}))

const disabled = ref<boolean>(false)

const contentClass = computed(() => (props.lineClamp > 1 ? 'text-hide-multiple' : 'text-hide-single'))

const handleMouseEnter = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const isOverflowing =
    props.lineClamp > 1 ? target.scrollHeight > target.clientHeight : target.scrollWidth > target.clientWidth

  disabled.value = !isOverflowing // disabled = true 表示不显示 tooltip
}
</script>

<style scoped lang="less">
.text-hide-single {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-hide-multiple {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--line-clamp);
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>
