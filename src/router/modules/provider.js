export default [
  {
    path: '/provider',
    name: 'Provider',
    component: () => import('../../pages/provider/index.vue'),
    meta: {
      requiresAuth: true,
      role: 'provider'
    }
  }
]
