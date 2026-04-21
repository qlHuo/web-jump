import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/index.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/search/index.vue'),
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue'),
    },
    // ⭐️ 通配符路由
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404', // 不存在的路由重定向到404
    },
  ],
})

export default router
