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
        path: 'conversa/:id',
        name: 'conversa',
        component: () => import('@/pages/ChatPage.vue'),
      },
      {
        path: 'auditoria',
        name: 'auditoria',
        component: () => import('@/pages/AuditoriaPage.vue'),
      },
      {
        path: 'ambiente',
        name: 'ambiente',
        component: () => import('@/pages/AmbientePage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
