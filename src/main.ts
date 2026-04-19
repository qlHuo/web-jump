import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'tdesign-vue-next/es/style/index.css'
import './assets/index.css'

// 全局组件注册
import registerGlobalComponents from '@/components/index'

import App from './App.vue'
import TDesign from 'tdesign-vue-next'
import router from './router'

const app = createApp(App)
// 全局组件注册
registerGlobalComponents(app)

app.use(createPinia())
app.use(TDesign)
app.use(router)

app.mount('#app')
