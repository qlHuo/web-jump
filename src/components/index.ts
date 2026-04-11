// 全局组件注册
import type { App } from 'vue'
import HiIcon from './icon/index.vue'
import HiTitle from './title/index.vue'
import HiEllipsis from './ellipsis/index.vue'

const components = {
  HiIcon,
  HiTitle,
  HiEllipsis,
}

export default function registerGlobalComponents(app: App) {
  Object.entries(components).forEach(([name, component]) => {
    console.log('注册全局组件：', name)
    app.component(name, component)
  })
}
