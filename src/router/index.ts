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
