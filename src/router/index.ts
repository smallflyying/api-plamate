import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/pages/Dashboard.vue'),
    },
    {
      path: '/usage',
      name: 'usage',
      component: () => import('@/pages/UsageDetail.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/Settings.vue'),
    },
  ],
})

export default router
