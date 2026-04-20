<template>
  <header
    :class="[
      'w-full flex justify-between gap-2 p-4 h-15',
      {
        'bg-white text-neutral-700 shadow-md': theme === 'light',
        'bg-transparent text-white': theme === 'transparent',
      },
    ]"
  >
    <div class="flex">
      <div class="flex items-center gap-2 cursor-pointer" @click="handleGoHome">
        <t-image class="w-6 h-6 !bg-transparent" :src="logo" alt="Web Jump Logo" />
        <h1 class="text-lg font-bold">Hi 导航</h1>
      </div>
      <slot name="content"></slot>
    </div>
    <slot name="right"></slot>
  </header>
</template>

<script lang="ts" setup>
import logo from '@/assets/logo.svg'
import router from '@/router'

const props = withDefaults(
  defineProps<{
    theme?: 'light' | 'transparent'
  }>(),
  {
    theme: 'light',
  }
)

const handleGoHome = () => {
  router.push('/')
}
</script>

<style scoped lang="less"></style>
