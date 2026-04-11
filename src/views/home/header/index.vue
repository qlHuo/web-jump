<template>
  <header class="h-50 w-full relative">
    <div
      :class="[
        'w-full flex justify-between gap-2 p-4 fixed top-0 left-0 z-2 h-15',
        {
          'bg-white text-neutral-700 shadow-md': isScrolled,
          'bg-transparent text-white': !isScrolled,
        },
      ]"
    >
      <div class="flex items-center gap-2">
        <img class="w-6 h-6" :src="logo" alt="Web Jump Logo" />
        <h1 class="text-lg font-bold">Hi 导航</h1>
      </div>
      <div class="md:hidden w-7 h-7 cursor-pointer" @click="handleToggleMenu">
        <HiIcon name="icon-ego-menu" size="20px" />
      </div>
    </div>
    <div class="h-full w-full">
      <img
        class="h-full w-full absolute top-0 left-0 object-cover opacity-95 sepia-50"
        style="filter: brightness(0.8)"
        src="https://bing.com/th?id=OHR.CastleBlossoms_ZH-CN3064288127_UHD.jpg"
        alt=""
      />
      <div class="absolute top-0 left-0 w-full h-full pt-15 flex flex-col items-center justify-center gap-4 z-1 p-4">
        <p class="text-white mt-2">一个简洁高效的导航工具，助你快速访问常用网站</p>
        <SearchInput />
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import logo from '@/assets/logo.svg'
import SearchInput from './components/SearchInput.vue'
import { useScroll } from '@/composable/useScroll'
import { useMenuStore } from '@/stores/menuStore.ts'

const { isScrolled } = useScroll(50)
const menuStore = useMenuStore()

const handleToggleMenu = () => {
  menuStore.toggleMenu()
}
</script>

<style scoped lang="less"></style>
