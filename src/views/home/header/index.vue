<template>
  <header class="h-50 w-full relative">
    <Header class="fixed top-0 left-0 z-2" :theme="headerTheme">
      <template #right>
        <div class="flex gap-2">
          <div v-show="isScrolled" class="w-7 h-7 cursor-pointer text-center" @click="bgSearch = true">
            <HiIcon name="icon-icon_searh" size="20px" />
          </div>
          <div class="md:hidden w-7 h-7 cursor-pointer text-center" @click="handleToggleMenu">
            <HiIcon name="icon-ego-menu" size="20px" />
          </div>
        </div>
      </template>
    </Header>
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

    <template v-if="bgSearch">
      <div
        class="fixed top-0 left-0 bottom-0 right-0 w-full h-full bg-black opacity-60 z-100"
        @click="bgSearch = false"
      ></div>
      <SearchInput class="fixed left-4 right-4 z-101 !w-[calc(100%-32px)]" />
    </template>
  </header>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import Header from '@/components/header/index.vue'
import SearchInput from './components/SearchInput.vue'
import { useScroll } from '@/composable/useScroll'
import { useMenuStore } from '@/stores/menuStore.ts'

const { isScrolled } = useScroll(60)
const menuStore = useMenuStore()
const bgSearch = ref(false)

const handleToggleMenu = () => {
  menuStore.toggleMenu()
}

const headerTheme = computed(() => {
  if (!isScrolled.value) {
    return 'transparent'
  } else {
    return 'light'
  }
})
</script>

<style scoped lang="less"></style>
