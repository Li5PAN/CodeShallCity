export default [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../../pages/admin/index.vue'),
    meta: {
      requiresAuth: true,
      role: 'admin'
    }
  }
]
