import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'list',
      component: () => import('@/views/ProjectListView.vue'),
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('@/views/ProjectCreateView.vue'),
    },
    {
      path: '/create/:id',
      name: 'edit',
      component: () => import('@/views/ProjectCreateView.vue'),
      props: (route) => ({
        projectId: route.params.id,
        mode: (route.query.mode as string) || 'edit',
      }),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
