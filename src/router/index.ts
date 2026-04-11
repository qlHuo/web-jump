import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    // 管理员界面（后续可细分为多个子路由，如目录管理、分类管理、网站管理等）
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/index.vue'),
    },
  ],
})

export default router
