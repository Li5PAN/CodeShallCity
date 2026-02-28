export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../../pages/login.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/logout',
    name: 'Logout',
    component: () => import('../../pages/logout.vue'),
    meta: {
      requiresAuth: false
    }
  }
]
