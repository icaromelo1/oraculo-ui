import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'chat', component: () => import('@/pages/ChatPage.vue') },
      {
        path: 'auditoria',
        name: 'auditoria',
        component: () => import('@/pages/AuditoriaPage.vue'),
      },
      { path: 'perfis', name: 'perfis', component: () => import('@/pages/PerfisPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
