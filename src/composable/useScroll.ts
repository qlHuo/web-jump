import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useScroll(threshold = 50) {
  const isScrolled = ref(false)

  const update = () => {
    isScrolled.value = window.scrollY > threshold
  }

  onMounted(() => {
    window.addEventListener('scroll', update)
    update()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', update)
  })

  return { isScrolled }
}
