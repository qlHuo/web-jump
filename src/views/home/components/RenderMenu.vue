<template>
  <!-- 移动端菜单 -->
  <Transition name="slide">
    <BaseMenu
      v-if="menuStore.showMenu"
      class="md:hidden fixed left-0 top-0 z-11 bg-white shadow-lg"
      @click="handleClickItem"
    />
  </Transition>

  <!-- 遮罩层（同样需要过渡） -->
  <Transition name="fade">
    <div
      v-if="menuStore.showMenu"
      class="md:hidden fixed inset-0 z-10 bg-black opacity-30"
      @click="menuStore.toggleMenu()"
    />
  </Transition>

  <!-- web端菜单 -->
  <BaseMenu class="hidden md:block bg-white rounded-xl sticky top-19" @click="handleClickItem" />
</template>

<script lang="ts" setup>
import type { Directory } from '@/db/models'
import { useMenuStore } from '@/stores/menuStore.ts'
import BaseMenu from './BaseMenu.vue'

const menuStore = useMenuStore()

const emit = defineEmits(['click'])
const handleClickItem = (item: Directory) => {
  emit('click', item)
}
</script>

<style scoped lang="less">
/* 菜单滑入滑出 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

/* 遮罩淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
